import { Component, ViewChild } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Observable, Subscription } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

export class RoomRequest {
    public Name = '';
    public Room = '';
    public Token = '';
};

var sdpConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};


@Component({
    selector: 'my-app',
    templateUrl: '/app/app.component.template.html',
    styleUrls: ['app/app.component.css'],
})

export class AppComponent implements OnInit, OnDestroy {

    public heroForm: FormGroup;
    public roomToken: string;
    public userToken: string;
    public message: string;
    private RoomConnection: RoomRequest;

    public peerConnection: RTCPeerConnection;
    public isGotRemoteStream: boolean;

    @ViewChild('clientvideo') clientVideo: any;
    @ViewChild('remotevideo') remoteVideo: any;
    clientStream: MediaStream;
    candidate: RTCIceCandidate;
    sdp: RTCSessionDescriptionInit;

    constructor(private fb: FormBuilder, private http: Http) {
        this.heroForm = this.fb.group({
            Name: ['', Validators.required],
            Room: ['', Validators.required],
            Token: ['']
        });
    }
    ngOnDestroy(): void {

    }

    ngOnInit(): void {

    }
    waitUntilRemoteStreamStartFlowing() {
        document.title = 'Waiting for remote stream flow!';

        if (!(this.remoteVideo.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || this.remoteVideo.paused || this.remoteVideo.currentTime <= 0)) {
            this.isGotRemoteStream = true;
            document.title = 'Finally got the remote stream!';
        } else setTimeout(this.waitUntilRemoteStreamStartFlowing, 3000);
    };
    RTCInit() {
        try {
            var iceServers = [];

            iceServers.push({
                url: 'stun:stun.l.google.com:19302'
            });

            iceServers.push({
                url: 'stun:stun.anyfirewall.com:3478'
            });

            iceServers.push({
                url: 'turn:turn.bistri.com:80',
                credential: 'homeo',
                username: 'homeo'
            });

            iceServers.push({
                url: 'turn:turn.anyfirewall.com:443?transport=tcp',
                credential: 'webrtc',
                username: 'webrtc'
            });


            this.peerConnection = new RTCPeerConnection({ "iceServers": iceServers });
            this.peerConnection.onicecandidate = (ev: RTCPeerConnectionIceEvent) => {
                if (this.isGotRemoteStream) return;

                var candidate = ev.candidate;

                if (candidate) {
                    var data = {
                        candidate: JSON.stringify(candidate.candidate),
                        label: candidate.sdpMLineIndex,
                        userToken: this.userToken,
                        roomToken: this.roomToken
                    };
                    this.http.post('/WebRTC/PostICE', data).subscribe((a: any) => {
                        if (a.ParticipantName) {
                            this.message = "Connected to " + a.ParticipantName;


                        }
                    });
                }
            };

            this.peerConnection.onaddstream = (ev: MediaStreamEvent) => {
                if (ev) {
                    document.title = 'Got a clue for remote video stream!';

                    this.clientVideo.pause();
                    this.clientVideo.hide();

                    this.remoteVideo.show();
                    this.remoteVideo.play();

                    this.remoteVideo.src = ev.stream;

                    document.title = 'Waiting for remote stream flow!';
                }
            };
            this.peerConnection.addStream(this.clientStream);

        } catch (e) {
            document.title = 'WebRTC is not supported in this web browser!';
            alert('WebRTC is not supported in this web browser!');
        }
    }
    checkRemoteICE() {
        if (this.isGotRemoteStream) return;

        if (!this.peerConnection) {
            setTimeout(this.checkRemoteICE, 1000);
            return;
        }

        var data = {
            userToken: this.userToken,
            roomToken: this.roomToken
        };
        this.http.post('/WebRTC/GetICE', data).subscribe((response: any) => {

            if (response === false && !this.isGotRemoteStream) setTimeout(this.checkRemoteICE, 1000);
            else {
                try {
                    this.candidate = new RTCIceCandidate({ sdpMLineIndex: response.label, candidate: JSON.parse(response.candidate) });
                    this.peerConnection.addIceCandidate(this.candidate);

                    !this.isGotRemoteStream && setTimeout(this.checkRemoteICE, 10);
                } catch (e) {
                    try {
                        this.candidate = new RTCIceCandidate({ sdpMLineIndex: response.label, candidate: JSON.parse(response.candidate) });
                        this.peerConnection.addIceCandidate(this.candidate);

                        !this.isGotRemoteStream && setTimeout(this.checkRemoteICE, 10);
                    } catch (e) {
                        !this.isGotRemoteStream && setTimeout(this.checkRemoteICE, 1000);
                    }
                }
            }

        });
    }
    waitForAnswer() {
        document.title = 'Waiting for answer...';

        var data = {
            userToken: this.userToken,
            roomToken: this.roomToken
        };
        this.http.post('/WebRTC/GetSDP', data).subscribe((a: any) => {
            if (a.sdp) {

                document.title = 'Got answer...';
                var response = a.sdp;
                try {
                    this.sdp = JSON.parse(response);
                    this.peerConnection.setRemoteDescription(new RTCSessionDescription(this.sdp));
                } catch (e) {
                    this.sdp = response;
                    this.peerConnection.setRemoteDescription(new RTCSessionDescription(this.sdp));
                }
            } else {
                setTimeout(this.waitForAnswer, 100);
            }
        });
    };

    createOffer() {
        this.RTCInit();
        this.peerConnection.createOffer((sessionDescription: RTCSessionDescription) => {
            this.peerConnection.setLocalDescription(sessionDescription);

            document.title = 'Created offer successfully!';
            var sdp = JSON.stringify(sessionDescription);

            var data = {
                sdp: sdp,
                userToken: this.userToken,
                roomToken: this.roomToken
            };
            this.http.post('/WebRTC/PostSDP', data).subscribe((a: any) => {
                if (a) {
                    document.title = 'Posted offer successfully!';
                    this.checkRemoteICE();
                    this.waitForAnswer();
                }
            });

        },
            (e) => { console.error(e); },
            sdpConstraints
        );

    }
    public waitForParticipant() {

        this.http.post('/WebRTC/GetParticipant', this.RoomConnection).subscribe((a: any) => {
            if (a.ParticipantName) {
                this.message = "Connected to " + a.ParticipantName;
                this.createOffer();
            } else {
                setTimeout(() => { this.waitForParticipant() }, 3000);
            }
        });

    }

    public onSubmit() {
        if (this.heroForm.valid) {
            this.RoomConnection = this.heroForm.value;
            this.http.post('/WebRTC/CreateRoom/', this.RoomConnection).subscribe((a: any) => {
                this.roomToken = a.roomToken;
                this.userToken = a.ownerToken;
                this.message = "Waiting for a participant!";
                this.waitForParticipant();

            });
        }
    }
}