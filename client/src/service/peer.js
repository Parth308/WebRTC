class PeerService {
    constructor() {
        // Create a new RTCPeerConnection if it doesn't exist
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: "stun:stun.l.google.com:19302",
                    },
                ],
            });
        }
    }

    async getOffer() {
        if (this.peer) {
            // Create an offer
            const offer = await this.peer.createOffer();
            // Set the local description of the peer connection to the offer
            await this.peer.setLocalDescription(offer);
            // Return the offer
            return offer;
        }
    }

    async getAnswer(offer) {
        if (this.peer && offer && offer.sdp && offer.type) {
            // Set the remote description of the peer connection to the offer
            await this.peer.setRemoteDescription(new RTCSessionDescription({ sdp: offer.sdp, type: offer.type }));
            // Create an answer
            const answer = await this.peer.createAnswer();
            // Set the local description of the peer connection to the answer
            await this.peer.setLocalDescription(answer);
            // Return the answer
            return answer;
        }
    }

    async setLocalDescription(answer) {
        if (this.peer) {
            // Set the remote description of the peer connection to the answer
            await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }
}

export default new PeerService();