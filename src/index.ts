import * as AWS from 'aws-sdk'

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
    info: (
      args: { options: IPublishOptions; result: AWS.SNS.Types.PublishResponse }
    ) => any
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

/**
 * Message-specific publish options.
 */
export interface IPublishOptions {
  /**
   * A JSON-encodable message object.
   */
  message: any

  /**
   * The topic you want to publish to.
   */
  topicARN: string

  /**
   * Any additional publish options. Values defined here override defaults.
   */
  extraOptions?: AWS.SNS.Types.PublishInput
}

/**
 * An SNS publisher with message building and logging.
 */
export class SimpleSNSPublisher {
  SNS: AWS.SNS
  options: ISimpleSNSPublisherOptions = {
    awsConfig: {},
    logEnabled: true,
    logHandler: {
      info: args => console.log('Published message', args),
      error: args => console.error('Publish failed', args)
    },
    logLevel: 'info',
    throwError: true
  }

  constructor(options: Partial<ISimpleSNSPublisherOptions> = {}) {
    const keys = Object.keys(options) as (keyof ISimpleSNSPublisherOptions)[]
    keys.forEach(k => {
      if (options[k] !== undefined) {
        this.options[k] = options[k]!
      }
    })

    this.SNS = new AWS.SNS(this.options.awsConfig)
  }

  /**
   * Publish a single message under given topic. Returns a promise.
   */
  publish(
    options: IPublishOptions
  ): Promise<AWS.SNS.Types.PublishResponse | void> {
    const { logEnabled, logHandler, logLevel, throwError } = this.options

    return this.SNS.publish({
      Message: JSON.stringify(options.message),
      TopicArn: options.topicARN,
      ...options.extraOptions
    })
      .promise()
      .then(result => {
        if (logEnabled && logLevel == 'info') {
          logHandler.info({ options, result })
        }
        return result
      })
      .catch(error => {
        if (logEnabled) {
          logHandler.error({ options, error })
        }
        if (throwError) {
          throw error
        }
      })
  }
}
