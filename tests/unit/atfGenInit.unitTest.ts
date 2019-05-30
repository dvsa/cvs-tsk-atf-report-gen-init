import {describe} from "mocha";
import {expect} from "chai";
import {Injector} from "../../src/models/injector/Injector";
import {SQService} from "../../src/services/SQService";
import {SQMockClient} from "../models/SQMockClient";
import * as fs from "fs";
import * as path from "path";
import {StreamService} from "../../src/services/StreamService";
import {PromiseResult} from "aws-sdk/lib/request";
import {ReceiveMessageResult, SendMessageResult} from "aws-sdk/clients/sqs";
import {AWSError} from "aws-sdk";
import {Configuration} from "../../src/utils/Configuration";

describe("atf-gen-init", () => {
    const event: any = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../resources/stream-event.json"), "utf8"));
    let processedEvent: any;

    context("StreamService", () => {
        const expectedResult: any[] = [
            {
                id: "5e4bd304-446e-4678-8289-d34fca9256e9",
                activityType: "visit",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132",
                startTime: "2019-02-13T09:27:21.077Z",
                endTime: "2019-02-12T15:25:27.077Z"
            }
        ];

        context("when fetching an activity stream", () => {
            it("should result in an array of filtered js objects", () => {
                processedEvent = StreamService.getActivitiesStream(event);
                expect(processedEvent).to.eql(expectedResult);
            });
        });
    });

    context("SQService", () => {
        let config: any = Configuration.getInstance().getConfig();
        const env: string = (!process.env.BRANCH || process.env.BRANCH === "local") ? "local" : "remote";
        config = config.sqs[env];
        const sqService: SQService = Injector.resolve<SQService>(SQService, [SQMockClient]);
        sqService.sqsClient.createQueue({
            QueueName: config.queueName
        });

        context("when adding a record to the queue", () => {
            it("should successfully add the records to the queue", () => {
                const sendMessagePromises: Array<Promise<PromiseResult<SendMessageResult, AWSError>>> = [];

                processedEvent.forEach(async (record: any) => {
                    sendMessagePromises.push(sqService.sendMessage(JSON.stringify(record)));
                });

                return Promise.all(sendMessagePromises)
                .catch((error: AWSError) => {
                    console.error(error);
                    expect.fail();
                });
            });

            it("should successfully read the added records from the queue", () => {
                return sqService.getMessages()
                .then((messages: ReceiveMessageResult) => {
                    expect(messages.Messages!.map((message) => JSON.parse(message.Body as string))).to.eql(processedEvent);
                });
            });
        });
    });
});
