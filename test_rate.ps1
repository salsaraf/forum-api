Write-Host "=== FORUM API RATE LIMIT TEST ===" -ForegroundColor Cyan
Write-Host "Testing: 90 requests per minute limit" -ForegroundColor Yellow
Write-Host "Endpoint: http://localhost:8080/threads/thread-JAKZ3mDGxQWFFxqX" -ForegroundColor Yellow
Write-Host ""

# Test 1: Fast requests (should get 429 after 90)
Write-Host "TEST 1: 95 rapid requests (delay 0ms)" -ForegroundColor Green
Write-Host "Expected: First 90 OK, next 5 get 429 error"
Write-Host ""

$success200 = 0
$error429 = 0
$other = 0

$startTime = Get-Date

for ($i = 1; $i -le 95; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/threads/thread-JAKZ3mDGxQWFFxqX" `
            -Method GET `
            -UseBasicParsing `
            -TimeoutSec 5 `
            -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "Request $($i.ToString().PadLeft(3)): OK (200)" -ForegroundColor Green
            $success200++
        } else {
            Write-Host "Request $($i.ToString().PadLeft(3)): Other ($($response.StatusCode))" -ForegroundColor Yellow
            $other++
        }
    }
    catch [System.Net.WebException] {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 429) {
            Write-Host "Request $($i.ToString().PadLeft(3)): RATE LIMITED (429)" -ForegroundColor Red
            $error429++
        } else {
            Write-Host "Request $($i.ToString().PadLeft(3)): Error ($statusCode)" -ForegroundColor Yellow
            $other++
        }
    }
    catch {
        Write-Host "Request $($i.ToString().PadLeft(3)): Exception ($($_.Exception.Message))" -ForegroundColor Yellow
        $other++
    }
    
    # Small delay to prevent overwhelming
    Start-Sleep -Milliseconds 50
}

$endTime = Get-Date
$duration = [math]::Round(($endTime - $startTime).TotalSeconds, 2)

Write-Host ""
Write-Host "=== TEST 1 RESULTS ===" -ForegroundColor Cyan
Write-Host "Total requests    : 95"
Write-Host "Successful (200)  : $success200"
Write-Host "Rate Limited (429): $error429"
Write-Host "Other responses   : $other"
Write-Host "Test duration     : ${duration}s"
Write-Host ""

# Test 2: Slow requests (all should succeed)
Write-Host "TEST 2: 90 slow requests (delay 667ms)" -ForegroundColor Green
Write-Host "Expected: All 90 requests should be OK (200)"
Write-Host ""

$success200_slow = 0
$error429_slow = 0

$startTime2 = Get-Date

for ($i = 1; $i -le 90; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/threads/thread-JAKZ3mDGxQWFFxqX" `
            -Method GET `
            -UseBasicParsing `
            -TimeoutSec 5 `
            -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "Request $($i.ToString().PadLeft(3)): OK (200)" -ForegroundColor Green
            $success200_slow++
        } else {
            Write-Host "Request $($i.ToString().PadLeft(3)): Other ($($response.StatusCode))" -ForegroundColor Yellow
        }
    }
    catch [System.Net.WebException] {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 429) {
            Write-Host "Request $($i.ToString().PadLeft(3)): RATE LIMITED (429)" -ForegroundColor Red
            $error429_slow++
        } else {
            Write-Host "Request $($i.ToString().PadLeft(3)): Error ($statusCode)" -ForegroundColor Yellow
        }
    }
    
    # Delay 667ms as per reviewer requirement
    Start-Sleep -Milliseconds 667
}

$endTime2 = Get-Date
$duration2 = [math]::Round(($endTime2 - $startTime2).TotalSeconds, 2)

Write-Host ""
Write-Host "=== TEST 2 RESULTS ===" -ForegroundColor Cyan
Write-Host "Total requests    : 90"
Write-Host "Successful (200)  : $success200_slow"
Write-Host "Rate Limited (429): $error429_slow"
Write-Host "Test duration     : ${duration2}s"
Write-Host ""

# Summary
Write-Host "=== FINAL VERIFICATION ===" -ForegroundColor Magenta
Write-Host "✓ Test 1: Rapid requests -> Should see 429 errors after 90 requests" -ForegroundColor $(if ($error429 -gt 0) { "Green" } else { "Red" })
Write-Host "✓ Test 2: Slow requests  -> Should see 0 errors with 667ms delay" -ForegroundColor $(if ($error429_slow -eq 0 -and $success200_slow -eq 90) { "Green" } else { "Red" })
Write-Host ""

if ($error429 -gt 0 -and $error429_slow -eq 0) {
    Write-Host "✅ SUCCESS: Rate limiting is working correctly!" -ForegroundColor Green
    Write-Host "   - Blocks rapid requests (>90/min)" -ForegroundColor Green
    Write-Host "   - Allows normal requests (with proper delay)" -ForegroundColor Green
} else {
    Write-Host "❌ ISSUE: Rate limiting may not be configured correctly" -ForegroundColor Red
    Write-Host "   Check your nginx configuration and container logs" -ForegroundColor Yellow
}