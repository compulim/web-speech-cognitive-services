import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { after, before } from 'node:test';

// `node --import` does passthrough things set on `globalThis` to the test.
// However, `node --test-global-setup` will not passthrough. The test will run without `globalThis.document`.
// Not sure if this is intentional or not. We must load this module using `node --import`.

before(() => {
  GlobalRegistrator.register({
    height: 1080,
    url: 'http://localhost:3000',
    width: 1920
  });
});

after(() => {
  // Must unregister, otherwise, there will be promises lingering.
  GlobalRegistrator.unregister();
});

export {};
