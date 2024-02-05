Certainly! Here are examples for both the `vaultService.ts` TypeScript file that contains the function to load vault secrets, and the corresponding test file `vaultService.test.ts` using Jest as the testing framework.

**vaultService.ts**

```typescript
// vaultService.ts

import * as vault from './path-to-vault-module'; // Adjust the path as necessary

export const loadVaultSecrets = async (): Promise<void> => {
  if (process.env.DISABLE_VAULT_SECRETS !== 'true') {
    try {
      const vaultContent = process.env.VAULT_SECRETS_PATH 
        ? await vault.read({ retries: 3, delay: 1000, path: process.env.VAULT_SECRETS_PATH })
        : null;

      if (vaultContent) {
        const vaultSecrets = vault.parse(vaultContent);
        if (Object.keys(vaultSecrets).length > 0) {
          process.env = {
            ...process.env,
            ...vaultSecrets,
          };
        }
      }
    } catch (error) {
      console.error('Failed to load vault secrets:', error);
      throw error; // Or handle it as per your error handling policy
    }
  }
};
```

**vaultService.test.ts**

```typescript
// vaultService.test.ts

import { loadVaultSecrets } from './vaultService';
import * as vault from './path-to-vault-module'; // Adjust the path as necessary

// Mocking the vault module
jest.mock('./path-to-vault-module', () => ({
  read: jest.fn(),
  parse: jest.fn()
}));

describe('loadVaultSecrets', () => {
  const originalProcessEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalProcessEnv };
  });

  afterAll(() => {
    process.env = originalProcessEnv;
  });

  it('loads secrets when DISABLE_VAULT_SECRETS is not true', async () => {
    process.env.DISABLE_VAULT_SECRETS = 'false';
    process.env.VAULT_SECRETS_PATH = '/fake/path';
    const mockSecrets = { secretKey: 'secretValue' };
    (vault.read as jest.Mock).mockResolvedValue(mockSecrets);
    (vault.parse as jest.Mock).mockReturnValue(mockSecrets);

    await loadVaultSecrets();

    expect(vault.read).toHaveBeenCalledWith({ retries: 3, delay: 1000, path: '/fake/path' });
    expect(process.env.secretKey).toEqual('secretValue');
  });

  it('does not load secrets when DISABLE_VAULT_SECRETS is true', async () => {
    process.env.DISABLE_VAULT_SECRETS = 'true';

    await loadVaultSecrets();

    expect(vault.read).not.toHaveBeenCalled();
  });

  // Add more tests to cover other cases, such as errors during reading the vault
});
```

In the test file, make sure you're mocking the actual vault module correctly, and that you're handling asynchronous code properly. The `jest.fn()` is used to create mock functions, and `mockResolvedValue` is used to mock the resolution of a promise returned by an async function. Adjust these examples as needed to fit your actual vault module's API and behavior.
