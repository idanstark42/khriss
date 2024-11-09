const checkoutNodeJssdk = require('@paypal/checkout-server-sdk')

const clientId = process.env.PAYPAL_CLIENT_ID
const clientSecret = process.env.PAYPAL_CLIENT_SECRET

function configureEnvironment () {
  return process.env.NODE_ENV === 'production'
    ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
    : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret)
}

module.exports = () => new checkoutNodeJssdk.core.PayPalHttpClient(configureEnvironment())
