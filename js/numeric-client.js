#!/usr/bin/env node
// Copyright 2016 Intel Corporation
// Copyright 2016 Samsung Electronics France SAS
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var iotivity = require( "iotivity-node/lowlevel" );
var sampleUri = "/NumericResURI";
var sampleResourceType = "org.example.numeric";
var gDestination = null;

var intervalId,
handleReceptacle = {};

var stdin = Object.getPrototypeOf(process.stdin);

function get(destination)
{
    if ( ! destination ) return;

    getHandleReceptacle = {};
    getResponseHandler = function( handle, response ) {
        console.log( "Received response to request:" );
        console.log( JSON.stringify( response, null, 4 ) );
        console.log( "value:" + response.payload.values.value );

        return iotivity.OCStackApplicationResult.OC_STACK_DELETE_TRANSACTION;
    }

    iotivity.OCDoResource(
        getHandleReceptacle,
        iotivity.OCMethod.OC_REST_GET,
        sampleUri,
        destination,
        {
            type: iotivity.OCPayloadType.PAYLOAD_TYPE_REPRESENTATION,
            values: {
                value: -1
            }
        },
        iotivity.OCConnectivityType.CT_DEFAULT,
        iotivity.OCQualityOfService.OC_HIGH_QOS,
        getResponseHandler,
        null );
    
    return iotivity.OCStackApplicationResult.OC_STACK_KEEP_TRANSACTION;
}


function menu(destination)
{
    console.log( "menu:" + destination);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    var value = 0;
    process.stdin.on('data', function (input) {
        value = parseInt(input.trim(), 10);
        get(destination);
    });
}


function discover()
{
    console.log( "Issuing discovery request" );
    iotivity.OCDoResource(
        handleReceptacle,
        iotivity.OCMethod.OC_REST_DISCOVER,
        iotivity.OC_MULTICAST_DISCOVERY_URI,
        null,
        null,
        iotivity.OCConnectivityType.CT_DEFAULT,
        iotivity.OCQualityOfService.OC_HIGH_QOS,
        function( handle, response ) {
            console.log( "Received response to DISCOVER request:" );
            console.log( JSON.stringify( response, null, 4 ) );
            var index,
            destination = response.addr,
            getHandleReceptacle = {},
            resources = response && response.payload && response.payload.resources,
            resourceCount = resources ? resources.length : 0,
            getResponseHandler = function( handle, response ) {
                console.log( "Received response to POST request:" );
                console.log( JSON.stringify( response, null, 4 ) );
                return iotivity.OCStackApplicationResult.OC_STACK_DELETE_TRANSACTION;
            };
            console.log( "destination=" + JSON.stringify( destination, null, 4 ) );
            console.log( "resources=" + JSON.stringify(resources) );
            var value = true;
            for ( index = 0; index < resourceCount; index++ ) {
                if ( resources[ index ].uri === sampleUri ) {
                    menu(destination);
                }
            }
            return iotivity.OCStackApplicationResult.OC_STACK_KEEP_TRANSACTION;
        },

        null );

}


console.log( "Starting OCF stack in client mode" );
iotivity.OCInit( null, 0, iotivity.OCMode.OC_CLIENT );
discover();
intervalId = setInterval( function() {
    iotivity.OCProcess();
}, 1000 );
