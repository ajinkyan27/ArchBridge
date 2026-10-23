<#
.SYNOPSIS
  Uploads the static export in .\out to the private S3 bucket and invalidates CloudFront.

.DESCRIPTION
  Manual deployment for Windows (PowerShell). Requires the AWS CLI v2, signed in
  with credentials allowed to write to the bucket and invalidate the distribution
  (for example `aws sso login --profile arcbridge`).

  Run `npm run build` first with the production .env.production.local values.
  The script refuses to upload a build that is missing, that came from the e2e
  test build, or that has no contact API URL (unless -AllowUnconfiguredContact).

.EXAMPLE
  .\scripts\deploy-site.ps1 -Bucket <bucket-name> -DistributionId <distribution-id> -Profile arcbridge
  .\scripts\deploy-site.ps1 -Bucket <bucket-name> -DistributionId <distribution-id> -DryRun
#>
param(
  [Parameter(Mandatory = $true)][string]$Bucket,
  [Parameter(Mandatory = $true)][string]$DistributionId,
  [string]$Profile,
  [switch]$DryRun,
  [switch]$AllowUnconfiguredContact
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'out'

if (-not (Test-Path (Join-Path $out 'index.html'))) { throw "No build found at $out. Run 'npm run build' first." }
if (-not (Test-Path (Join-Path $out '404.html'))) { throw "404.html missing from the build." }

$html = Get-ChildItem $out -Recurse -Include *.html, *.txt | Select-String -Pattern 'e2e\.invalid' -List
if ($html) { throw "This looks like an end-to-end test build (found 'e2e.invalid'). Run 'npm run build' again." }

$chunks = Get-ChildItem (Join-Path $out '_next\static') -Recurse -Filter *.js | Select-String -Pattern 'execute-api|/enquiries' -List
if (-not $chunks -and -not $AllowUnconfiguredContact) {
  throw "The build does not contain a contact API URL (NEXT_PUBLIC_CONTACT_API_URL). Set it and rebuild, or pass -AllowUnconfiguredContact."
}

$common = @()
if ($Profile) { $common += @('--profile', $Profile) }
$dry = @()
if ($DryRun) { $dry += '--dryrun' }

Write-Host "1/3 Uploading hashed assets (immutable, long cache)..." -ForegroundColor Cyan
aws s3 sync (Join-Path $out '_next\static') "s3://$Bucket/_next/static" `
  --cache-control 'public, max-age=31536000, immutable' @dry @common
if ($LASTEXITCODE -ne 0) { throw 'Asset upload failed.' }

Write-Host "2/3 Uploading pages and other files (short cache), removing deleted files..." -ForegroundColor Cyan
# Old hashed assets under _next/static are kept so cached pages keep working.
aws s3 sync $out "s3://$Bucket" --delete --exclude '_next/static/*' `
  --cache-control 'public, max-age=0, s-maxage=300, must-revalidate' @dry @common
if ($LASTEXITCODE -ne 0) { throw 'Page upload failed.' }

if ($DryRun) { Write-Host 'Dry run complete. Nothing was uploaded or invalidated.' -ForegroundColor Yellow; return }

Write-Host "3/3 Invalidating CloudFront cache..." -ForegroundColor Cyan
$inv = aws cloudfront create-invalidation --distribution-id $DistributionId --paths '/*' --query 'Invalidation.Id' --output text @common
if ($LASTEXITCODE -ne 0) { throw 'Invalidation failed.' }
Write-Host "Done. Invalidation $inv submitted; changes are usually live within a few minutes." -ForegroundColor Green
