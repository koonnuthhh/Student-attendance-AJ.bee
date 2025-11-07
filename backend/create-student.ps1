# Create Student User Script
$baseUrl = "http://localhost:3000/api"

Write-Host "`n=== Creating Student User ===`n" -ForegroundColor Cyan

# Step 1: Register a teacher account (needed to generate student codes)
Write-Host "1. Registering teacher account..." -ForegroundColor Yellow
$teacherBody = @{
    email = "demo.teacher@test.com"
    password = "Demo123!"
    name = "Demo Teacher"
    role = "Teacher"
} | ConvertTo-Json

try {
    $teacherResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $teacherBody -ContentType "application/json"
    Write-Host "✅ Teacher registered successfully!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠️  Teacher already exists, continuing..." -ForegroundColor DarkYellow
    } else {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Login as teacher
Write-Host "`n2. Logging in as teacher..." -ForegroundColor Yellow
$teacherLoginBody = @{
    email = "demo.teacher@test.com"
    password = "Demo123!"
} | ConvertTo-Json

try {
    $teacherLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $teacherLoginBody -ContentType "application/json"
    $teacherToken = $teacherLoginResponse.accessToken
    Write-Host "✅ Teacher login successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Generate student code
Write-Host "`n3. Generating student code..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $teacherToken"
}

try {
    $studentCodeResponse = Invoke-RestMethod -Uri "$baseUrl/student-codes/generate" -Method POST -Headers $headers -ContentType "application/json"
    $studentCode = $studentCodeResponse.code
    Write-Host "✅ Student code generated!" -ForegroundColor Green
    Write-Host "Student Code: $studentCode" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to generate student code: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Register student with the code
Write-Host "`n4. Registering student with code..." -ForegroundColor Yellow
$studentBody = @{
    email = "demo.student@test.com"
    password = "Demo123!"
    name = "Demo Student"
    role = "Student"
    studentCode = $studentCode
} | ConvertTo-Json

try {
    $studentResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $studentBody -ContentType "application/json"
    Write-Host "✅ Student registered successfully!" -ForegroundColor Green
    Write-Host "Student ID: $($studentResponse.user.id)" -ForegroundColor Gray
    Write-Host "Student Name: $($studentResponse.user.name)" -ForegroundColor Gray
    Write-Host "Student Email: $($studentResponse.user.email)" -ForegroundColor Gray
    Write-Host "Student Code: $($studentResponse.user.studentCode)" -ForegroundColor Cyan
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

# Step 5: Test student login
Write-Host "`n5. Testing student login..." -ForegroundColor Yellow
$studentLoginBody = @{
    email = "demo.student@test.com"
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

# Step 6: Get student profile
Write-Host "`n6. Getting student profile..." -ForegroundColor Yellow
$studentHeaders = @{
    Authorization = "Bearer $studentToken"
}

try {
    $studentProfile = Invoke-RestMethod -Uri "$baseUrl/users/me" -Method GET -Headers $studentHeaders
    Write-Host "✅ Student profile retrieved!" -ForegroundColor Green
    Write-Host "Profile:" -ForegroundColor Cyan
    Write-Host "  Name: $($studentProfile.name)" -ForegroundColor Gray
    Write-Host "  Email: $($studentProfile.email)" -ForegroundColor Gray
    Write-Host "  Student Code: $($studentProfile.studentCode)" -ForegroundColor Gray
    Write-Host "  Roles: $($studentProfile.roles -join ', ')" -ForegroundColor Gray
    Write-Host "  Status: $($studentProfile.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get student profile: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Student User Created Successfully! ===`n" -ForegroundColor Green
Write-Host "You can now use these credentials to test the student interface:" -ForegroundColor Cyan
Write-Host "  Email: demo.student@test.com" -ForegroundColor Yellow
Write-Host "  Password: Demo123!" -ForegroundColor Yellow
Write-Host "  Student Code: $studentCode" -ForegroundColor Yellow
Write-Host "`nThe student is ready to use in your mobile app!" -ForegroundColor Green