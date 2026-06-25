$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$SiteVideos = Join-Path $Root "site\videos"
$VideosDir = Join-Path $Root "Videos"

New-Item -ItemType Directory -Force -Path $SiteVideos | Out-Null

function Copy-VideoMatch {
    param(
        [string]$Pattern,
        [string]$TargetName,
        [string]$FallbackPath = ""
    )

    $match = Get-ChildItem -LiteralPath $VideosDir -Filter "*.mp4" -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -like $Pattern } |
        Select-Object -First 1

    if (-not $match -and $FallbackPath -and (Test-Path -LiteralPath $FallbackPath)) {
        Copy-Item -LiteralPath $FallbackPath -Destination (Join-Path $SiteVideos $TargetName) -Force
        Write-Host "Copied fallback -> site/videos/$TargetName"
        return
    }

    if ($match) {
        Copy-Item -LiteralPath $match.FullName -Destination (Join-Path $SiteVideos $TargetName) -Force
        Write-Host "Copied $($match.Name) -> site/videos/$TargetName"
        return
    }

    Write-Warning "Video not found for pattern: $Pattern"
}

Copy-VideoMatch -Pattern "*Селсап*" -TargetName "wb-selsup-supply.mp4"
Copy-VideoMatch -Pattern "*объедин*" -TargetName "merge-supply-card.mp4"
Copy-VideoMatch -Pattern "" -TargetName "honest-sign-base.mp4" -FallbackPath (Join-Path $Root "source_video.mp4")

Write-Host "Deploy media prepared in site/videos"
