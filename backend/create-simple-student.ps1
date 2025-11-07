# Simple Student Creation Script
$baseUrl = "http://localhost:3000/api"

Write-Host "`n=== Creating Simple Student User ===`n" -ForegroundColor Cyan

# Register student without code
Write-Host "1. Registering student without code..." -ForegroundColor Yellow
$studentBody = @{
    email = "simple.student@test.com"
    password = "Demo123!"
    name = "Simple Student"
    role = "Student"
} | ConvertTo-Json

try {
    $studentResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $studentBody -ContentType "application/json"
    Write-Host "✅ Student registered successfully!" -ForegroundColor Green
    Write-Host "Student ID: $($studentResponse.user.id)" -ForegroundColor Gray
    Write-Host "Student Name: $($studentResponse.user.name)" -ForegroundColor Gray
    Write-Host "Student Email: $($studentResponse.user.email)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠️  Student already exists, trying login..." -ForegroundColor DarkYellow
    } else {
        Write-Host "❌ Error registering student: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
        exit 1
    }
}

# Test student login
Write-Host "`n2. Testing student login..." -ForegroundColor Yellow
$studentLoginBody = @{
    email = "simple.student@test.com"
    password = "Demo123!"
} | ConvertTo-Json

try {
    $studentLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $studentLoginBody -ContentType "application/json"
    $studentToken = $studentLoginResponse.accessToken
    Write-Host "✅ Student login successful!" -ForegroundColor Green
    Write-Host "Access Token: $($studentToken.Substring(0, 50))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Student login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Get student profile
Write-Host "`n3. Getting student profile..." -ForegroundColor Yellow
$studentHeaders = @{
    Authorization = "Bearer $studentToken"
}

try {
    $studentProfile = Invoke-RestMethod -Uri "$baseUrl/users/me" -Method GET -Headers $studentHeaders
    Write-Host "✅ Student profile retrieved!" -ForegroundColor Green
    Write-Host "Profile:" -ForegroundColor Cyan
    Write-Host "  Name: $($studentProfile.name)" -ForegroundColor Gray
    Write-Host "  Email: $($studentProfile.email)" -ForegroundColor Gray
    Write-Host "  Roles: $($studentProfile.roles -join ', ')" -ForegroundColor Gray
    Write-Host "  Status: $($studentProfile.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get student profile: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Student User Created Successfully! ===`n" -ForegroundColor Green
Write-Host "You can now use these credentials to test the student interface:" -ForegroundColor Cyan
Write-Host "  Email: simple.student@test.com" -ForegroundColor Yellow
Write-Host "  Password: Demo123!" -ForegroundColor Yellow
Write-Host "`nThe student is ready to use in your mobile app!" -ForegroundColor Green