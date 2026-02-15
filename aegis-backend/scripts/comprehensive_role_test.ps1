# AEGIS Comprehensive Role-Based Testing Script
# Tests Student, Faculty, Admin roles for bugs, data fetching, and connections

$base = "https://aegis-krackhack.onrender.com/api"

# Test credentials
$roles = @{
    "Student" = @{
        email = "priya.singh@aegis.edu"
        password = "aegis@2025"
        endpoints = @(
            "opportunities",
            "opportunities/1",
            "applications",
            "bookmarks",
            "tasks",
            "academic/resources",
            "academic/courses",
            "users/profile"
        )
    }
    "Faculty" = @{
        email = "rajesh.kumar@aegis.edu"
        password = "aegis@2025"
        endpoints = @(
            "opportunities",
            "opportunities/new",
            "tasks",
            "academic/courses",
            "academic/enrollments",
            "users/profile",
            "academic/events"
        )
    }
    "Admin" = @{
        email = "admin@aegis.edu"
        password = "aegis@2025"
        endpoints = @(
            "admin/users",
            "admin/grievances",
            "admin/reports",
            "admin/dashboard",
            "users",
            "grievances",
            "opportunities"
        )
    }
}

# Function to test login and get token
function Get-Token {
    param($email, $password)
    
    try {
        $body = @{
            email = $email
            password = $password
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$base/auth/login" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -UseBasicParsing `
            -TimeoutSec 10
        
        $data = $response.Content | ConvertFrom-Json
        return $data.token
    } catch {
        Write-Host "❌ Login failed for $email" -ForegroundColor Red
        Write-Host $_.Exception.Message
        return $null
    }
}

# Function to test endpoint
function Test-Endpoint {
    param($url, $token, $method = "GET")
    
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri $url `
            -Method $method `
            -Headers $headers `
            -UseBasicParsing `
            -TimeoutSec 10
        
        $data = $response.Content | ConvertFrom-Json
        return @{
            status = "✅"
            code = $response.StatusCode
            dataCount = if ($data -is [array]) { $data.Count } else { 1 }
            hasData = $data.Count -gt 0 -or $response.Content.Length -gt 0
            content = $data
        }
    } catch {
        return @{
            status = "❌"
            error = $_.Exception.Message
            code = $_.Exception.Response.StatusCode.Value
        }
    }
}

# Main testing loop
$results = @()

foreach ($role in $roles.Keys) {
    Write-Host "`n" + ("="*60) -ForegroundColor Cyan
    Write-Host "Testing as $role" -ForegroundColor Cyan
    Write-Host ("="*60) -ForegroundColor Cyan
    
    $creds = $roles[$role]
    
    # Login test
    Write-Host "`n🔐 LOGIN TEST" -ForegroundColor Yellow
    $token = Get-Token $creds.email $creds.password
    
    if ($token) {
        Write-Host "✅ Login successful" -ForegroundColor Green
        Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Write-Host "❌ Login failed - SKIPPING OTHER TESTS" -ForegroundColor Red
        continue
    }
    
    # Test endpoints
    Write-Host "`n📡 ENDPOINT TESTS" -ForegroundColor Yellow
    
    foreach ($endpoint in $creds.endpoints) {
        $url = "$base/$endpoint"
        Write-Host "`nTesting: GET $endpoint" -ForegroundColor White
        
        $result = Test-Endpoint $url $token
        
        if ($result.status -eq "✅") {
            Write-Host "  Status: 200 OK" -ForegroundColor Green
            Write-Host "  Data fetched: $($result.dataCount) items" -ForegroundColor Green
            if ($result.hasData) {
                Write-Host "  Sample: $($result.content | ConvertTo-Json -Depth 1 | Select-Object -First 200)" -ForegroundColor Gray
            } else {
                Write-Host "  ⚠️  WARNING: No data returned!" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  Status: ERROR" -ForegroundColor Red
            if ($result.code) {
                Write-Host "  Code: $($result.code)" -ForegroundColor Red
            }
            Write-Host "  Error: $($result.error)" -ForegroundColor Red
        }
    }
}

Write-Host "`n" + ("="*60) -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host ("="*60) -ForegroundColor Cyan
