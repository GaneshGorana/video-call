function Peer(obj = {}) {
    const peer = new RTCPeerConnection(obj);
    return peer;
}

export default Peer;