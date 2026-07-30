# Verification

After running the installation, you should verify that everything is working properly. The easiest way is to run:

```bash
npm run verify
```

## What the automated verification checks:

1. **Database Version:** Ensures `COMPATIBLE` is at least `23.9.0`.
2. **Extended Strings:** Ensures `MAX_STRING_SIZE` is `EXTENDED`.
3. **TDE Wallet:** Ensures `V$ENCRYPTION_WALLET` reports `OPEN`.
4. **Schema Creation:** Confirms your project schema exists.
5. **BAAS_ROLE:** Confirms the schema has been granted the `BAAS_ROLE`.
6. **ORDS Enablement:** Confirms the schema is REST-enabled in `USER_ORDS_SCHEMAS`.
7. **Console Accessibility:** Pings the console endpoint to ensure it returns HTTP 200/302.

If any of these checks fail, run `npm run status` to view a detailed diagnostic report, or refer to [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
