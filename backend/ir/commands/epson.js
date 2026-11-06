module.exports = {
    powerOn: {
        protocol: 'NEC2',
        address: 0x5583,
        command: 0x90,
    },

    powerOff: {
        protocol: 'NEC2',
        address: 0x5583,
        command: 0x91,
    },

    hdmi1: {
        protocol: 'NEC2',
        address: 0x5583,
        command: 0x73,
    },

    hdmi2: {
        protocol: 'NEC2',
        address: 0x5583,
        command: 0x77,
    },

    volumeUp: {
        protocol: 'NEC2',
        address: 0x5583,
        command: 0x98,
    },

    volumeDown: {
        protocol: 'NEC2',
        address: 0x5583,
        command: 0x99,
    }
};