"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular/core");
const forms_1 = require("@angular/forms");
const http_1 = require("@angular/http");
const RX_1 = require("rxjs/RX");
class RoomRequest {
    constructor() {
        this.Name = '';
        this.Room = '';
        this.Token = '';
    }
}
exports.RoomRequest = RoomRequest;
;
let WebRTCComponent = class WebRTCComponent {
    constructor(fb, http) {
        this.fb = fb;
        this.http = http;
        this.Rooms = new Array();
        this.heroForm = this.fb.group({
            Name: ['', forms_1.Validators.required],
            Room: ['', forms_1.Validators.required],
            Token: ['']
        });
        this.sdpConstraints = {
            optional: new Array(),
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            }
        };
    }
    ngOnDestroy() {
        if (this.sub)
            this.sub.unsubscribe();
    }
    ngOnInit() {
        navigator.getUserMedia({ audio: true, video: true }, (stream) => {
            console.log("getUserMedia success");
            this.clientVideo.nativeElement.srcObject = stream;
            this.clientStream = stream;
            this.clientVideo.nativeElement.play();
        }, function () {
            console.log("getUserMedia failed");
            //location.reload();
        });
        this.sub = RX_1.Observable.interval(1000 * 5).subscribe(a => {
            this.http.post('/WebRTC/SearchPublicRooms', {}).subscribe((a) => {
                var response = a.json();
                this.message = response.availableRooms + ' available public rooms, ' + response.publicActiveRooms + ' active public rooms and ' + response.privateAvailableRooms + ' available private rooms';
                this.Rooms = response.rooms;
            });
        });
    }
    waitUntilRemoteStreamStartFlowing() {
        console.log('Waiting for remote stream flow!');
        if (!(this.remoteVideo.nativeElement.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || this.remoteVideo.nativeElement.paused || this.remoteVideo.nativeElement.currentTime <= 0)) {
            this.isGotRemoteStream = true;
            console.log('Finally got the remote stream!');
        }
        else {
            setTimeout(() => { this.waitUntilRemoteStreamStartFlowing(); }, 3000);
        }
    }
    ;
    RTCInit() {
        try {
            var iceServers = [];
            iceServers.push({
                urls: 'stun:stun.l.google.com:19302'
            });
            iceServers.push({
                urls: 'stun:stun.anyfirewall.com:3478'
            });
            iceServers.push({
                urls: 'turn:turn.bistri.com:80',
                credential: 'homeo',
                username: 'homeo'
            });
            iceServers.push({
                urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
                credential: 'webrtc',
                username: 'webrtc'
            });
            this.peerConnection = new RTCPeerConnection({ "iceServers": iceServers });
            this.peerConnection.onicecandidate = (ev) => {
                if (this.isGotRemoteStream)
                    return;
                var candidate = ev.candidate;
                if (candidate) {
                    var data = {
                        candidate: JSON.stringify(candidate.candidate),
                        label: candidate.sdpMLineIndex,
                        userToken: this.userToken,
                        roomToken: this.roomToken
                    };
                    this.http.post('/WebRTC/PostICE', data).subscribe((a) => {
                        var response = a.json();
                        if (response.ParticipantName) {
                            this.message = "Connected to " + response.ParticipantName;
                        }
                    });
                }
            };
            this.peerConnection.onaddstream = (ev) => {
                if (ev) {
                    console.log('Got a clue for remote video stream!');
                    this.remoteVideo.nativeElement.srcObject = ev.stream;
                    this.remoteVideo.nativeElement.play();
                    console.log('Waiting for remote stream flow!');
                }
            };
            this.peerConnection.addStream(this.clientStream);
        }
        catch (e) {
            document.title = 'WebRTC is not supported in this web browser!';
            alert('WebRTC is not supported in this web browser!');
        }
    }
    checkRemoteICE() {
        if (this.isGotRemoteStream)
            return;
        if (!this.peerConnection) {
            setTimeout(() => { this.checkRemoteICE(); }, 1000);
            return;
        }
        var data = {
            userToken: this.userToken,
            roomToken: this.roomToken
        };
        this.http.post('/WebRTC/GetICE', data).subscribe((a) => {
            var response = a.json();
            if (response === false && !this.isGotRemoteStream)
                setTimeout(() => { this.checkRemoteICE(); }, 1000);
            else {
                try {
                    this.candidate = new RTCIceCandidate({ sdpMLineIndex: response.label, candidate: JSON.parse(response.candidate) });
                    this.peerConnection.addIceCandidate(this.candidate);
                    !this.isGotRemoteStream && setTimeout(() => { this.checkRemoteICE(); }, 10);
                }
                catch (e) {
                    try {
                        this.candidate = new RTCIceCandidate({ sdpMLineIndex: response.label, candidate: JSON.parse(response.candidate) });
                        this.peerConnection.addIceCandidate(this.candidate);
                        !this.isGotRemoteStream && setTimeout(() => { this.checkRemoteICE(); }, 10);
                    }
                    catch (e) {
                        !this.isGotRemoteStream && setTimeout(() => { this.checkRemoteICE(); }, 1000);
                    }
                }
            }
        });
    }
    waitForAnswer() {
        console.log('Waiting for answer...');
        var data = {
            userToken: this.userToken,
            roomToken: this.roomToken
        };
        this.http.post('/WebRTC/GetSDP', data).subscribe((a) => {
            var response = a.json();
            if (response.sdp) {
                console.log('Got answer...');
                try {
                    this.sdp = JSON.parse(response.sdp);
                    this.peerConnection.setRemoteDescription(new RTCSessionDescription(this.sdp));
                }
                catch (e) {
                    this.sdp = response.sdp;
                    this.peerConnection.setRemoteDescription(new RTCSessionDescription(this.sdp));
                }
            }
            else {
                setTimeout(() => { this.waitForAnswer(); }, 100);
            }
        });
    }
    ;
    createOffer() {
        console.log('Creating offer...');
        this.RTCInit();
        this.peerConnection.createOffer((sessionDescription) => {
            this.peerConnection.setLocalDescription(sessionDescription);
            console.log('Created offer successfully!');
            this.sdp = JSON.stringify(sessionDescription);
            var data = {
                sdp: this.sdp,
                userToken: this.userToken,
                roomToken: this.roomToken
            };
            this.http.post('/WebRTC/PostSDP', data).subscribe((a) => {
                var response = a.json();
                if (response) {
                    console.log('Posted offer successfully!');
                    this.checkRemoteICE();
                    this.waitForAnswer();
                }
            });
        }, (e) => { console.error(e); }, this.sdpConstraints);
    }
    waitForParticipant() {
        var data = {
            roomToken: this.roomToken,
            ownerToken: this.userToken
        };
        this.http.post('/WebRTC/GetParticipant', data).subscribe((a) => {
            var response = a.json();
            if (response.participant) {
                this.message = "Connected to " + response.participant;
                this.createOffer();
            }
            else {
                setTimeout(() => { this.waitForParticipant(); }, 3000);
            }
        });
    }
    createAnswer(sdpResponse) {
        this.RTCInit();
        console.log('Creating answer...');
        var sdp;
        try {
            sdp = JSON.parse(sdpResponse);
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        }
        catch (e) {
            sdp = sdpResponse;
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        }
        this.peerConnection.createAnswer((sessionDescription) => {
            this.peerConnection.setLocalDescription(sessionDescription);
            console.log('Created answer successfully!');
            sdp = JSON.stringify(sessionDescription);
            var data = {
                sdp: sdp,
                userToken: this.userToken,
                roomToken: this.roomToken
            };
            this.http.post('/WebRTC/PostSDP', data).subscribe((a) => {
                var response = a.json();
                console.log('Posted answer successfully!');
            });
        }, (e) => { console.error(e); });
    }
    ;
    waitForOffer() {
        document.title = 'Waiting for offer...';
        var data = {
            userToken: this.userToken,
            roomToken: this.roomToken
        };
        this.http.post('/WebRTC/GetSDP', data).subscribe((a) => {
            var response = a.json();
            if (response.sdp) {
                console.log('Got offer...');
                this.createAnswer(response.sdp);
            }
            else {
                setTimeout(() => {
                    this.waitForOffer();
                }, 100);
            }
        });
    }
    ;
    joinroom(room) {
        if (!this.clientStream) {
            return;
        }
        var data = {
            roomToken: room.Token,
            participant: "testname"
        };
        this.roomToken = room.Token;
        this.http.post('/WebRTC/JoinRoom', data).subscribe((a) => {
            var response = a.json();
            if (response.participantToken) {
                this.userToken = response.participantToken;
                document.title = 'Connected with ' + response.friend + '!';
                this.checkRemoteICE();
                setTimeout(() => {
                    this.waitForOffer();
                }, 3000);
            }
        });
    }
    onSubmit() {
        if (this.heroForm.valid) {
            this.RoomConnection = this.heroForm.value;
            this.http.post('/WebRTC/CreateRoom/', this.RoomConnection).subscribe((a) => {
                var response = a.json();
                this.roomToken = response.roomToken;
                this.userToken = response.ownerToken;
                this.message = "Waiting for a participant!";
                this.waitForParticipant();
            });
        }
    }
};
__decorate([
    core_1.ViewChild('clientvideo'),
    __metadata("design:type", Object)
], WebRTCComponent.prototype, "clientVideo", void 0);
__decorate([
    core_1.ViewChild('remotevideo'),
    __metadata("design:type", Object)
], WebRTCComponent.prototype, "remoteVideo", void 0);
WebRTCComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        templateUrl: '/app/app.component.template.html',
        styleUrls: ['app/app.component.css'],
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, http_1.Http])
], WebRTCComponent);
exports.WebRTCComponent = WebRTCComponent;
//# sourceMappingURL=app.component.js.map