function getExtension(fileName) {
    let extension = 'jpg';
    if (fileName && !fileName.endsWith('.jpg')) {
        extension = 'JPG';
    }
    return extension;
}

function getHostName() {
    if (typeof getHostName._hostName === 'undefined') {
        let hostname = !window.origin ? window.location.origin : window.origin;
        /*
        Check the cases where the hostname is SVC and viewer is bundled with API
        and deployed.All other cases point to production.
        */
        const urlMap = {
            test: 'https://svc-test.homeaway.com/havr-api',
            stage: 'https://svc-stage.homeaway.com/havr-api',
            production: 'https://svc.homeaway.com/havr-api'
        };

        const allowedDomains = ['localhost', 'homeaway.com'];
        // App was started with an explicit ENV parameter
        // eslint-disable-next-line no-undef
        if (urlMap[__ENV__]) {
            return urlMap[__ENV__]; // eslint-disable-line
            // Default to using test data when running locally
        } else if (hostname.includes(allowedDomains[0])) {
            getHostName._hostName = urlMap.test;
            // If deployed somewhere weird, use production data
        } else if (
            !hostname.includes('expedia') &&
            !hostname.includes('svc') &&
            !hostname.endsWith(allowedDomains[1])
        ) {
            getHostName._hostName = urlMap.production;
            // Otherwise, use the same host
        } else {
            getHostName._hostName = `${hostname}/havr-api`;
        }
    }
    return getHostName._hostName;
}

function _replaceExtension(fileName, extension, newExtension) {
    if (fileName.endsWith(extension)) {
        return fileName.substr(0, fileName.lastIndexOf(extension)) + newExtension;
    }
    return fileName;
}

function getImageUrlFromName(imageName, quality = 'q6', useMediaGateway) {
    if (useMediaGateway) {
        return getMediaGatewayUrl(imageName, quality);
    }

    const extension = getExtension(imageName);
    const newFileName = _replaceExtension(imageName, extension, `tn.${quality}.${extension}`);

    return `${getHostName()}/v1/images/${newFileName}`;
}

function getEnvironmentName() {
    if (!getEnvironmentName._appenvironment) {
        let hostname;
        // Hostname is undefined while page is still initializing, so use origin if needed
        if (window.location.hostname && window.location.hostname.length) {
            hostname = window.location.hostname.toLowerCase();
        } else {
            hostname = window.location.origin.toLowerCase();
        }

        // let hostname = window.location.hostname.toLowerCase();
        if (hostname.indexOf('localhost') >= 0) {
            getEnvironmentName._appenvironment = 'dev';
        } else if (hostname.indexOf('test') >= 0) {
            getEnvironmentName._appenvironment = 'test';
        } else if (hostname.indexOf('stage') >= 0) {
            getEnvironmentName._appenvironment = 'stage';
        } else {
            getEnvironmentName._appenvironment = 'production';
        }
    }
    return getEnvironmentName._appenvironment;
}

module.exports = {
    getEnvironmentName,
    getExtension,
    getHostName,
    getImageUrlFromName,
    getMediaGatewayUrl
};
