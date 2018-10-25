// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var iotHubTransport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

var ProvisioningTransport = require('azure-iot-provisioning-device-http').Http;
// Feel free to change the preceding using statement to anyone of the following if you would like to try another protocol.
// var ProvisioningTransport = require('azure-iot-provisioning-device-amqp').Amqp;
// var ProvisioningTransport = require('azure-iot-provisioning-device-amqp').AmqpWs;
// var ProvisioningTransport = require('azure-iot-provisioning-device-mqtt').Mqtt;
// var ProvisioningTransport = require('azure-iot-provisioning-device-mqtt').MqttWs;

var symmetricKeySecurity = require('azure-iot-security-symmetric-key');
var ProvisioningDeviceClient = require('azure-iot-provisioning-device').ProvisioningDeviceClient;

//
// For the public clouds the address of the provisioning host would be: global.azure-devices-provisioning.net
//
var provisioningHost = '<the host for provisioning>';

//
// You can find your idScope in the portal overview section for your dps instance.
//
var idScope = '<id scope for dps instance>';

//
// The registration id of the device to be registered.
//
var registrationId = '<registration id for device>';

var symmetricKey = '<symmetric key for device>';

var provisioningSecurityClient = new symmetricKeySecurity.SymmetricKeySecurityClient(symmetricKey, registrationId);

var provisioningClient = ProvisioningDeviceClient.create(provisioningHost, idScope, new ProvisioningTransport(), provisioningSecurityClient);
// Register the device.  Do not force a re-registration.
provisioningClient.register(function(err, result) {
  if (err) {
    console.log("error registering device: " + err);
  } else {
    console.log('registration succeeded');
    console.log('assigned hub=' + result.assignedHub);
    console.log('deviceId=' + result.deviceId);
    var connectionString = 'HostName=' + result.assignedHub + ';DeviceId=' + result.deviceId + ';SharedAccessKey=' + symmetricKey;
    var hubClient = Client.fromConnectionString(connectionString, iotHubTransport);

    var connectCallback = function (err) {
      if (err) {
        console.error('Could not connect: ' + err.message);
      } else {
        console.log('Client connected');
        var message = new Message('Hello world');
        hubClient.sendEvent(message, printResultFor('send'));
      }
    };

    hubClient.open(connectCallback);

    function printResultFor(op) {
      return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
        process.exit(1);
      };
    }
  }
});
