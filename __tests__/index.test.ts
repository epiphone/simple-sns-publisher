import * as AWS from 'aws-sdk-mock'

import { SimpleSNSPublisher } from '../src'

const PUBLISH_OPTIONS = {
  message: ['value1', 123, { x: 'y' }],
  topicARN: 'arn:aws:sns:us-west-2:111122223333:MyTopic'
}
const PUBLISH_RESULT = { MessageId: 'some-id' }
const PUBLISH_ERROR = { code: 'some-error' }

describe('index', () => {
  afterEach(() => AWS.restore('SNS'))

  it('publishes to SNS topic', async () => {
    expect.assertions(2)
    const spy = jest.fn((_params, cb) => cb(null, PUBLISH_RESULT))
    AWS.mock('SNS', 'publish', spy)

    const publisher = new SimpleSNSPublisher()
    const res = await publisher.publish(PUBLISH_OPTIONS)
    expect(res).toEqual(PUBLISH_RESULT)

    expect(spy.mock.calls).toEqual([
      [
        {
          Message: JSON.stringify(PUBLISH_OPTIONS.message),
          TopicArn: PUBLISH_OPTIONS.topicARN
        },
        expect.any(Function)
      ]
    ])
  })

  it('throws error if publish fails', async () => {
    expect.assertions(1)
    const spy = jest.fn((_params, cb) => cb(PUBLISH_ERROR, null))
    AWS.mock('SNS', 'publish', spy)

    const publisher = new SimpleSNSPublisher()
    try {
      await publisher.publish(PUBLISH_OPTIONS)
    } catch (error) {
      expect(error).toEqual(PUBLISH_ERROR)
    }
  })

  it('fires and forgets if throwError is disabled', async () => {
    const spy = jest.fn((_params, cb) => cb(PUBLISH_ERROR, null))
    AWS.mock('SNS', 'publish', spy)

    await new SimpleSNSPublisher({ throwError: false }).publish(PUBLISH_OPTIONS)
  })

  it('logs result or error via given log handler', async () => {
    expect.assertions(2)
    const spy = jest
      .fn()
      .mockImplementationOnce((_params, cb) => cb(null, PUBLISH_RESULT))
      .mockImplementationOnce((_params, cb) => cb(PUBLISH_ERROR, null))
    AWS.mock('SNS', 'publish', spy)

    const mockHandler = { info: jest.fn(), error: jest.fn() }
    const publisher = new SimpleSNSPublisher({
      logHandler: mockHandler,
      throwError: false
    })

    await publisher.publish(PUBLISH_OPTIONS)
    await publisher.publish(PUBLISH_OPTIONS)

    expect(mockHandler.info.mock.calls).toEqual([
      [{ options: PUBLISH_OPTIONS, result: PUBLISH_RESULT }]
    ])
    expect(mockHandler.error.mock.calls).toEqual([
      [{ options: PUBLISH_OPTIONS, error: PUBLISH_ERROR }]
    ])
  })

  it('does not log if logEnabled set to false', async () => {
    expect.assertions(2)
    const spy = jest
      .fn()
      .mockImplementationOnce((_params, cb) => cb(null, PUBLISH_RESULT))
      .mockImplementationOnce((_params, cb) => cb(PUBLISH_ERROR, null))
    AWS.mock('SNS', 'publish', spy)

    const mockHandler = { info: jest.fn(), error: jest.fn() }
    const publisher = new SimpleSNSPublisher({
      logEnabled: false,
      logHandler: mockHandler,
      throwError: false
    })

    await publisher.publish(PUBLISH_OPTIONS)
    await publisher.publish(PUBLISH_OPTIONS)

    expect(mockHandler.info.mock.calls).toEqual([])
    expect(mockHandler.error.mock.calls).toEqual([])
  })

  it('only logs errors if logLevel set to "error"', async () => {
    expect.assertions(2)
    const spy = jest
      .fn()
      .mockImplementationOnce((_params, cb) => cb(null, PUBLISH_RESULT))
      .mockImplementationOnce((_params, cb) => cb(PUBLISH_ERROR, null))
    AWS.mock('SNS', 'publish', spy)

    const mockHandler = { info: jest.fn(), error: jest.fn() }
    const publisher = new SimpleSNSPublisher({
      logHandler: mockHandler,
      logLevel: 'error',
      throwError: false
    })

    await publisher.publish(PUBLISH_OPTIONS)
    await publisher.publish(PUBLISH_OPTIONS)

    expect(mockHandler.info.mock.calls).toEqual([])
    expect(mockHandler.error.mock.calls).toEqual([
      [{ options: PUBLISH_OPTIONS, error: PUBLISH_ERROR }]
    ])
  })

  it('sets AWS credentials as per constructor options', () => {
    const awsConfig = {
      accessKeyId: 'some-access-key',
      region: 'eu-central-1',
      secretAccessKey: 'my-secret-key'
    }
    const publisher = new SimpleSNSPublisher({ awsConfig })
    expect(publisher.SNS.config).toMatchObject(awsConfig)
  })
})
