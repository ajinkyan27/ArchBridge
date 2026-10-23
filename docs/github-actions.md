# Optional: deploy with GitHub Actions (OIDC, no stored AWS keys)

Two workflows are included:

| Workflow | Trigger | Touches AWS? |
| --- | --- | --- |
| `.github/workflows/ci.yml` | every push to `main` and every pull request | **No.** Runs lint, typecheck, unit tests, build, export check, Lambda bundle and Playwright. |
| `.github/workflows/deploy-site.yml` | **manual only** (*Actions → Deploy website → Run workflow*) | Yes: builds, uploads `out/` to S3, invalidates CloudFront. Defaults to **dry run**. |

Set up the manual deployment in [deployment-aws.md](deployment-aws.md) and use it at least once before enabling this. The workflow does exactly the same steps as `scripts/deploy-site.ps1`.

## 1. Create the deploy role (once)

[`infrastructure/github-oidc/template.yaml`](../infrastructure/github-oidc/template.yaml) creates:

- the GitHub OIDC identity provider (skip with `CreateOidcProvider=false` if the account already has one);
- an IAM role that **only** jobs in `repo:<owner>/<repo>:environment:production` can assume;
- permissions limited to: list/put/delete/get objects in the site bucket, and create/get invalidations on the one distribution.

```powershell
aws cloudformation deploy `
  --stack-name arcbridge-github-deploy `
  --template-file infrastructure/github-oidc/template.yaml `
  --capabilities CAPABILITY_IAM `
  --parameter-overrides GitHubOwner=ajinkyan27 GitHubRepo=ArchBridge `
      SiteBucketName=<BucketName> DistributionId=<DistributionId> `
  --profile <profile> --region <region>

aws cloudformation describe-stacks --stack-name arcbridge-github-deploy --query "Stacks[0].Outputs" --output table --profile <profile> --region <region>
```

Copy **DeployRoleArn**.

## 2. Configure the GitHub environment

GitHub → repository → **Settings → Environments → New environment** → `production`.

- **Deployment protection rules:** add yourself as a *Required reviewer*, so every deploy waits for your approval.
- **Deployment branches:** restrict to `main`.
- **Environment variables** (*Variables*, not secrets; none of these are sensitive):

| Variable | Example / source |
| --- | --- |
| `AWS_REGION` | region of the hosting stack |
| `AWS_DEPLOY_ROLE_ARN` | `DeployRoleArn` output |
| `SITE_BUCKET` | `BucketName` output of the hosting stack |
| `CLOUDFRONT_DISTRIBUTION_ID` | `DistributionId` output |
| `NEXT_PUBLIC_SITE_URL` | canonical origin, e.g. `https://www.arcbridgeanalytics.com` |
| `NEXT_PUBLIC_CONTACT_API_URL` | `ContactApiUrl` output of the contact API stack |
| `NEXT_PUBLIC_CONTACT_EMAIL` | optional |
| `NEXT_PUBLIC_LINKEDIN_URL` | optional |

No GitHub **secrets** are needed. The workflow gets short-lived AWS credentials from the role via OIDC.

## 3. Run it

1. *Actions → Deploy website → Run workflow* with **Dry run** ticked (the default). Review the log: it lists every upload and delete it would make.
2. Run again with Dry run unticked. Approve the environment deployment when prompted.
3. Do the checks in deployment-aws.md §6.

**Rollback:** *Run workflow*, choose an earlier commit or tag from *Use workflow from*, and run with Dry run unticked.

## Hardening notes

- For stricter supply-chain control, pin the third-party actions (`actions/checkout`, `actions/setup-node`, `aws-actions/configure-aws-credentials`, `actions/upload-artifact`) to full commit SHAs.
- The role trust policy is scoped to the `production` environment, so a workflow on another branch or a fork can't assume it.
