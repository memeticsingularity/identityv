$nodePath = 'D:\Users\abyss\AppData\Local\nvm\v24.15.0'
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')

if ($userPath -notlike "*$nodePath*") {
    $newPath = $userPath + ';' + $nodePath
    [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
    Write-Host '已添加 Node 路径到用户环境变量 PATH'
} else {
    Write-Host 'Node 路径已在 PATH 中'
}

Write-Host ""
Write-Host '验证:'
Write-Host "Node 路径: $nodePath"
Write-Host '包含 node 的 PATH 条目:'
([Environment]::GetEnvironmentVariable('Path', 'User') -split ';') | Where-Object { $_ -match 'nvm|node' } | ForEach-Object { Write-Host "  $_" }
