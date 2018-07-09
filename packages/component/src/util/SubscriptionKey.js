import exchangeToken from './exchangeToken';

// Token expiration is hardcoded at 10 minutes
// https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/how-to/how-to-authentication?tabs=Powershell#use-an-authorization-token
const TOKEN_EXPIRATION = 600000;
const TOKEN_EARLY_RENEWAL = 60000;

export default class {
  constructor(subscriptionKey) {
    this.subscriptionKey = subscriptionKey;

    this._renew();
  }

  async _renew() {
    clearTimeout(this._renewal);

    this.authorized = exchangeToken(this.subscriptionKey);
    this.value = await this.authorized;

    this._renewal = setTimeout(() => {
      this._renew();
    }, TOKEN_EXPIRATION - TOKEN_EARLY_RENEWAL);
  }
}
