# simple-sns-publisher

[![Build Status](https://travis-ci.org/epiphone/simple-sns-publisher.svg?branch=master)](https://travis-ci.org/epiphone/simple-sns-publisher) [![codecov](https://codecov.io/gh/epiphone/simple-sns-publisher/branch/master/graph/badge.svg)](https://codecov.io/gh/epiphone/simple-sns-publisher)

A simple wrapper over [AWS NodeJS SDK](https://aws.amazon.com/sdk-for-node-js/) for publishing JSON-formatted messages on a SNS topic.

## ~~Install~~

~~`yarn install simple-sns-publisher`~~

**Still under development!**

## Usage

```typescript
import { SimpleSNSPublisher } from 'simple-sns-publisher'

const sns = new SimpleSNSPublisher()
sns.publish({
  message: { eventId: '1234-asdf', someKey: 'value' },
  topicARN: 'arn:aws:sns:us-west-2:111122223333:MyTopic'
})
```

The above results in the following SNS message:

```json
{
  "Message": {"eventId": "1234-asdf", "someKey": "value"},
  "TopicArn": "arn:aws:sns:us-west-2:111122223333:MyTopic"
}
```

## Configuration options

```typescript
/**
 * SNS publisher constructor options.
 */
export interface ISimpleSNSPublisherOptions {
  /**
   * AWS client configuration passed on to the SNS object constructor.
   * Define your API keys either here or in environment variables.
   */
  awsConfig: AWS.SNS.Types.ClientConfiguration

  /**
   * Whether logging is enabled or not - defaults to true.
   */
  logEnabled: boolean

  /**
   * The handler used to log publish result/error - defaults to
   * console.log/console.error. E.g. a Winston instance can be passed here.
   */
  logHandler: {
    info: (args: { options: IPublishOptions; result: AWS.SNS.Types.PublishResponse }) => any
    error: (args: { options: IPublishOptions; error: AWS.AWSError }) => any
  }

  /**
   * Logging level - defaults to 'info'. Set to 'error' to only log errors.
   */
  logLevel: 'info' | 'error'

  /**
   * Whether publish errors should be propagated or just logged - defaults to true.
   */
  throwError: boolean
}
```

## Related projects

- The handy [aws-sdk-mock](https://github.com/dwyl/aws-sdk-mock) mocking library used for tests

## TODO

- Set SNS message attributes to allow filtering
