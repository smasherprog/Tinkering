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
require("rxjs/add/operator/map");
require("rxjs/add/operator/toPromise");
class RoomRequest {
    constructor() {
        this.Name = '';
        this.Room = '';
        this.Token = '';
    }
}
exports.RoomRequest = RoomRequest;
;
var sdpConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};
let AppComponent = class AppComponent {
    constructor(fb, http) {
        this.fb = fb;
        this.http = http;
        this.heroForm = this.fb.group({
            Name: ['', forms_1.Validators.required],
            Room: ['', forms_1.Validators.required],
            Token: ['']
        });
    }
    ngOnDestroy() {
    }
    ngOnInit() {
    }
    waitUntilRemoteStreamStartFlowing() {
        document.title = 'Waiting for remote stream flow!';
        if (!(this.remoteVideo.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || this.remoteVideo.paused || this.remoteVideo.currentTime <= 0)) {
            this.isGotRemoteStream = true;
            document.title = 'Finally got the remote stream!';
        }
        else
            setTimeout(this.waitUntilRemoteStreamStartFlowing, 3000);
    }
    ;
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
                        if (a.ParticipantName) {
                            this.message = "Connected to " + a.ParticipantName;
                        }
                    });
                }
            };
            this.peerConnection.onaddstream = (ev) => {
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
            setTimeout(this.checkRemoteICE, 1000);
            return;
        }
        var data = {
            userToken: this.userToken,
            roomToken: this.roomToken
        };
        this.http.post('/WebRTC/GetICE', data).subscribe((response) => {
            if (response === false && !this.isGotRemoteStream)
                setTimeout(this.checkRemoteICE, 1000);
            else {
                try {
                    this.candidate = new RTCIceCandidate({ sdpMLineIndex: response.label, candidate: JSON.parse(response.candidate) });
                    this.peerConnection.addIceCandidate(this.candidate);
                    !this.isGotRemoteStream && setTimeout(this.checkRemoteICE, 10);
                }
                catch (e) {
                    try {
                        this.candidate = new RTCIceCandidate({ sdpMLineIndex: response.label, candidate: JSON.parse(response.candidate) });
                        this.peerConnection.addIceCandidate(this.candidate);
                        !this.isGotRemoteStream && setTimeout(this.checkRemoteICE, 10);
                    }
                    catch (e) {
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
        this.http.post('/WebRTC/GetSDP', data).subscribe((a) => {
            if (a.sdp) {
                document.title = 'Got answer...';
                var response = a.sdp;
                try {
                    this.sdp = JSON.parse(response);
                    this.peerConnection.setRemoteDescription(new RTCSessionDescription(this.sdp));
                }
                catch (e) {
                    this.sdp = response;
                    this.peerConnection.setRemoteDescription(new RTCSessionDescription(this.sdp));
                }
            }
            else {
                setTimeout(this.waitForAnswer, 100);
            }
        });
    }
    ;
    createOffer() {
        this.RTCInit();
        this.peerConnection.createOffer((sessionDescription) => {
            this.peerConnection.setLocalDescription(sessionDescription);
            document.title = 'Created offer successfully!';
            var sdp = JSON.stringify(sessionDescription);
            var data = {
                sdp: sdp,
                userToken: this.userToken,
                roomToken: this.roomToken
            };
            this.http.post('/WebRTC/PostSDP', data).subscribe((a) => {
                if (a) {
                    document.title = 'Posted offer successfully!';
                    this.checkRemoteICE();
                    this.waitForAnswer();
                }
            });
        }, (e) => { console.error(e); }, sdpConstraints);
    }
    waitForParticipant() {
        this.http.post('/WebRTC/GetParticipant', this.RoomConnection).subscribe((a) => {
            if (a.ParticipantName) {
                this.message = "Connected to " + a.ParticipantName;
                this.createOffer();
            }
            else {
                setTimeout(() => { this.waitForParticipant(); }, 3000);
            }
        });
    }
    onSubmit() {
        if (this.heroForm.valid) {
            this.RoomConnection = this.heroForm.value;
            this.http.post('/WebRTC/CreateRoom/', this.RoomConnection).subscribe((a) => {
                this.roomToken = a.roomToken;
                this.userToken = a.ownerToken;
                this.message = "Waiting for a participant!";
                this.waitForParticipant();
            });
        }
    }
};
__decorate([
    core_1.ViewChild('clientvideo'),
    __metadata("design:type", Object)
], AppComponent.prototype, "clientVideo", void 0);
__decorate([
    core_1.ViewChild('remotevideo'),
    __metadata("design:type", Object)
], AppComponent.prototype, "remoteVideo", void 0);
AppComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        templateUrl: '/app/app.component.template.html',
        styleUrls: ['app/app.component.css'],
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, http_1.Http])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map