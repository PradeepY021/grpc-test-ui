# 🔑 GitHub Token Guide

## Token You Already Have
```
YOUR_GITHUB_TOKEN
```

## Token Requirements

### Type: Personal Access Token (PAT)
- Classic token or Fine-grained token (both work)

### Required Scopes/Permissions

#### For Classic Token:
- ✅ `repo` (Full control of private repositories)
  - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`

#### For Fine-grained Token:
- ✅ Repository access: `product-assortment-service` (read access)
- ✅ Permissions needed:
  - `Contents: Read` (to read repository)
  - `Metadata: Read` (always included)

### Minimum Required
- **Read access** to the `zeptonow/product-assortment-service` repository

## How to Create/Regenerate Token

### Option 1: Classic Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: `gRPC Test UI - Product Assortment Service`
4. Expiration: Choose your preference (90 days, 1 year, or no expiration)
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
6. Click "Generate token"
7. Copy the token immediately (you won't see it again!)

### Option 2: Fine-grained Token
1. Go to: https://github.com/settings/tokens?type=beta
2. Click "Generate new token"
3. Name: `gRPC Test UI - Product Assortment Service`
4. Expiration: Choose your preference
5. Repository access: Select `zeptonow/product-assortment-service`
6. Permissions:
   - ✅ `Contents: Read`
   - ✅ `Metadata: Read` (automatic)
7. Click "Generate token"
8. Copy the token

## Test Your Token

### Test if token works:
```bash
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

Should return your user info if token is valid.

### Test repository access:
```bash
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/repos/zeptonow/product-assortment-service
```

Should return repository info if you have access.

## Troubleshooting

### Error: "Bad credentials" or "401"
- Token is invalid or expired
- Solution: Generate a new token

### Error: "Resource not accessible by integration"
- Token doesn't have `repo` scope
- Solution: Create new token with `repo` permission

### Error: "Permission denied"
- Token doesn't have access to the repository
- Solution: Ensure token has access to `zeptonow/product-assortment-service`

## Security Best Practices

1. ✅ **Don't commit tokens to git**
2. ✅ **Use environment variables** (if deploying)
3. ✅ **Set expiration** (recommended: 90 days)
4. ✅ **Revoke old tokens** when creating new ones
5. ✅ **Use fine-grained tokens** for better security (if available)

## Your Current Token

```
YOUR_GITHUB_TOKEN
```

**Status**: If you're getting authentication errors, this token might be:
- Expired
- Revoked
- Missing `repo` scope
- Doesn't have access to the repository

**Solution**: Create a new token following the steps above.

