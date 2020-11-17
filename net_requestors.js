/*jslint
    fudge, node
*/

import {
    get,
    createServer
} from "https";

/*
Comm requestors:
HTTP request -> response (client side)

server side:
    a request is simply a function call to generate a response
        which may be async

    pushing data to clients would need a requestor (awaiting ack of push?)
*/

/*
https.server is an EventEmitter

Events:
connection - when TCP stream established, before TLS handshake (pass socket)
keylog - when key material generated or recd by a connection
newSession - upon creation of a new TLS session
OCSPRequest - client sends cert status req
resumeSession - client requests to resume prev TLS session
secureConnection - after handshake for new connection is completed (pass socket)
tlsClientError - err occurs before secure connection established
close - when server closes (after all connections ended)
error
listening - after server bound w/ .listen()
newListener - new listener about to be added (but not yet)
removeListener - after listener removed

from http:
checkContinue - req with 100-continue rec'd
checkExpectation - req with Expect header (not 100-continue)
clientError - client connection emits error event (socket)
connect - client requests Connect (socket)
request
upgrade - client requests upgrade

Methods:
.close()
*.listen()
.setTimeout() - set socket timeout interval

from tls:
.addContext() - add secure context (for separate sites on same server)
.getTicketKeys() - returns session ticket keys
.setSecureContext() - replace secure context of existing server
.setTicketKeys() - set session ticket keys

from net:
.getConnections() - async get number of concurrent connections
.ref() - undo .unref()
.unref() - allow program to exit if this is only active server on system

from EventEmitter:
.addListener() = .on(eventName, listener)
.emit() - emit an event (calls all registered listeners sync)
.off() = .removeListener()
*.on() - add listener to event
*.once() - one-time listener (triggered for one event, removed)
.prependListener() - add listener to beginning of list
.prependOnceListener() - add one-time listener to beginning of list
.removeAllListeners() - remove all (or all for event)
.removeListener() - remove a listeners from an event
.setMaxListeners() - for individual EventEmmiter instances

Properties:
.headersTimeout - max wait time for headers to arrive
.maxHeadersCount
.timeout - length of socket timeout interval
.keepAliveTimeout - interval after last response on socket before destroying it
.address - address & port info
.listening - boolean
.maxConnections - reject when reached
.defaultMaxListeners - max listeners for ALL EventEmmiter instances
.errorMonitor - symbol used to install an "error only" listener, called first
.eventNames() - array listing events that have listeners
.getMaxListeners() - current max listeners
.listenerCount() - number of listeners for an event
.rawListeners() - copy of array of listeners for an event
*/

const https_create_server = function https_create_server_requestor (callback) {
    return function (options) {
        try {
            callback(createServer(options));
        } catch (exception) {
            callback(undefined, exception.message);
        }
    };
};

const server_close = function close_server_requestor (callback) {
    return function (server) {

// If server was already closed, node returns an error
        const node_callback = function (ignore) {
            callback(server);
        };

        try {
            server.close(node_callback);
        } catch (exception) {
            callback(undefined, exception.message);
        }
    };
};

const server_connection_listen = function (options) {
    return function connection_listen_requestor (callback) {
        return function (server) {
            try {
                callback(server.listen(options));
            } catch (exception) {
                callback(undefined, exception.message);
            }
        };
    };
};

const server_event_listen = function ({
    event_name,
    listener,
    once = false
}) {
    return function event_listen_requestor (callback) {
        return function (server) {
            try {
                callback((
                    (once === true)
                    ? server.once
                    : server.on
                )(event_name, listener));
            } catch (exception) {
                callback (undefined, exception.message);
            }
        };
    };
};

// url -> Buffer
const https_get = function (options = {}) {
    return function https_get_requestor (callback) {
        return function (url) {

            const response_handler = function (res) {

                let data = [];

                res.on("data", function (chunk) {
                    data.push(chunk);
                });

                res.on("end", function () {
                    if (res.statusCode < 400) {
                        callback(
                            undefined,
                            "Ended with status code " + res.statusCode
                        );
                    } else if (!res.complete) {
                        callback(undefined, "Ended incomplete");
                    } else {
                        callback(Buffer.concat(data));
                    }
                });

                res.on("error", function (e) {
                    callback(undefined, e.message);
                });

                res.on("aborted", function () {
                    callback(undefined, "Request aborted");
                });

            };

            try {
                const req = get(url, options, response_handler);

                req.on("error", function (e) {
                    callback (undefined, e.message);
                });

                return function (ignore) {
                    req.abort();
                };
            } catch (exception) {
                callback(undefined, exception.message);
            }
        };
    };
};

export {
    https_get,
    https_create_server,
    server_close,
    server_connection_listen,
    server_event_listen
};