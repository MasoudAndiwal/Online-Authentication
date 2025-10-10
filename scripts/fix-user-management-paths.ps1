# PowerShell script to fix all user-management paths
# This script updates paths from /user-management/* to /dashboard/user-management/*

$files = @(
    "app\(office)\dashboard\user-management\teachers\page.tsx",
    "app\(office)\dashboard\user-management\students\page.tsx",
    "app\(office)\dashboard\user-management\add-teacher\page.tsx",
    "app\(office)\dashboard\user-management\add-student\page.tsx",
    "app\(office)\dashboard\user-management\add-user\page.tsx",
    "app\(office)\dashboard\user-management\edit-teacher\[id]\page.tsx",
    "app\(office)\dashboard\user-management\edit-student\[id]\page.tsx"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot "..\$file"
    if (Test-Path $fullPath) {
        Write-Host "Updating: $file"
        $content = Get-Content $fullPath -Raw
        
        # Replace all /user-management/ paths with /dashboard/user-management/
        $content = $content -replace '"/user-management/', '"/dashboard/user-management/'
        $content = $content -replace "'/user-management/", "'/dashboard/user-management/"
        
        Set-Content $fullPath $content -NoNewline
        Write-Host "  ✓ Updated"
    } else {
        Write-Host "  ✗ File not found: $file"
    }
}

Write-Host ""
Write-Host "All paths updated successfully!"
