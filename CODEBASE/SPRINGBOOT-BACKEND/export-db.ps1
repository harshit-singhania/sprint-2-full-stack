# =============================================================
# export-db.ps1
# Exports all Derby table data to src/main/resources/data-derby.sql
# The app must NOT be running when this script executes.
# =============================================================

$M2      = "$env:USERPROFILE\.m2\repository\org\apache\derby"
$CP      = "$M2\derby\10.16.1.1\derby-10.16.1.1.jar;" +
           "$M2\derbyshared\10.16.1.1\derbyshared-10.16.1.1.jar;" +
           "$M2\derbytools\10.16.1.1\derbytools-10.16.1.1.jar"
$DB_PATH = "usedcarsdb"
$OUT     = "src\main\resources\data-derby.sql"
$TMP     = "$env:TEMP\derby_export_$(Get-Random)"
New-Item -ItemType Directory -Force -Path $TMP | Out-Null

# Tables in FK-safe insertion order
$TABLES = @(
    "USERS",
    "CARS",
    "PAYMENTS",
    "PURCHASE_ORDERS",
    "RECENT_VIEWS",
    "WISHLIST_ITEMS",
    "FEEDBACK",
    "SUPPORT_TICKETS",
    "TICKET_RESPONSES"
)

# Columns in the exact order Derby exports them (alphabetical)
$COLUMNS = @{
    USERS            = @("ID","ACTIVE_SESSION_EXPIRES_AT","ACTIVE_SESSION_TOKEN_HASH","EMAIL","NAME","PASSWORD_HASH","PHONE_NUMBER","ROLE","USERNAME")
    CARS             = @("ID","APPROVAL_STATUS","AVAILABLE","COLOR","MAKE","MILEAGE","MODEL","MANUFACTURING_YEAR","PRICE","VIEW_COUNT","SELLER_ID")
    PAYMENTS         = @("ID","AMOUNT","FAILURE_REASON","GATEWAY_NAME","GATEWAY_TRANSACTION_ID","METHOD","STATUS")
    PURCHASE_ORDERS  = @("ID","FRAUD_ALERT","STATUS","BUYER_ID","CAR_ID","PAYMENT_ID","SELLER_ID")
    RECENT_VIEWS     = @("ID","SESSION_TOKEN","VIEWED_AT","CAR_ID","USER_ID")
    WISHLIST_ITEMS   = @("ID","ADDED_AT","CAR_ID","USER_ID")
    FEEDBACK         = @("ID","COMMENT","CREATED_AT","RATING","CAR_ID","USER_ID")
    SUPPORT_TICKETS  = @("ID","CREATED_AT","STATUS","SUBJECT","UPDATED_AT","USER_ID")
    TICKET_RESPONSES = @("ID","MESSAGE","SENT_AT","SENDER_ID","TICKET_ID")
}

$UNIQUE_KEY = @{
    USERS            = "USERNAME"
    CARS             = "ID"
    PAYMENTS         = "ID"
    PURCHASE_ORDERS  = "ID"
    RECENT_VIEWS     = "ID"
    WISHLIST_ITEMS   = "ID"
    FEEDBACK         = "ID"
    SUPPORT_TICKETS  = "ID"
    TICKET_RESPONSES = "ID"
}

# Column SQL types — used to cast NULLs correctly in Derby SELECT
$COL_TYPE = @{
    ID                       = "BIGINT"
    ACTIVE_SESSION_EXPIRES_AT = "TIMESTAMP"
    ACTIVE_SESSION_TOKEN_HASH = "VARCHAR(255)"
    EMAIL                    = "VARCHAR(255)"
    NAME                     = "VARCHAR(255)"
    PASSWORD_HASH            = "VARCHAR(255)"
    PHONE_NUMBER             = "VARCHAR(20)"
    ROLE                     = "VARCHAR(20)"
    USERNAME                 = "VARCHAR(255)"
    APPROVAL_STATUS          = "VARCHAR(30)"
    AVAILABLE                = "SMALLINT"
    COLOR                    = "VARCHAR(50)"
    MAKE                     = "VARCHAR(100)"
    MILEAGE                  = "INTEGER"
    MODEL                    = "VARCHAR(100)"
    MANUFACTURING_YEAR       = "INTEGER"
    PRICE                    = "DECIMAL(19,2)"
    VIEW_COUNT               = "BIGINT"
    SELLER_ID                = "BIGINT"
    AMOUNT                   = "DECIMAL(19,2)"
    FAILURE_REASON           = "VARCHAR(500)"
    GATEWAY_NAME             = "VARCHAR(100)"
    GATEWAY_TRANSACTION_ID   = "VARCHAR(255)"
    METHOD                   = "VARCHAR(50)"
    STATUS                   = "VARCHAR(30)"
    FRAUD_ALERT              = "SMALLINT"
    BUYER_ID                 = "BIGINT"
    CAR_ID                   = "BIGINT"
    PAYMENT_ID               = "BIGINT"
    SESSION_TOKEN            = "VARCHAR(255)"
    VIEWED_AT                = "TIMESTAMP"
    USER_ID                  = "BIGINT"
    ADDED_AT                 = "TIMESTAMP"
    COMMENT                  = "VARCHAR(2000)"
    CREATED_AT               = "TIMESTAMP"
    RATING                   = "INTEGER"
    SUBJECT                  = "VARCHAR(255)"
    UPDATED_AT               = "TIMESTAMP"
    MESSAGE                  = "VARCHAR(2000)"
    SENT_AT                  = "TIMESTAMP"
    SENDER_ID                = "BIGINT"
    TICKET_ID                = "BIGINT"
    DESCRIPTION              = "VARCHAR(2000)"
}

# Numeric types — output value without quotes
$NUMERIC_TYPES = @("BIGINT","INTEGER","DECIMAL(19,2)","SMALLINT")

# Format a value for SQL SELECT
function Sql-Val($colName, $v) {
    $type = if ($COL_TYPE.ContainsKey($colName)) { $COL_TYPE[$colName] } else { "VARCHAR(255)" }
    if ($null -eq $v -or $v -eq "") {
        return "CAST(NULL AS $type)"
    }
    if ($NUMERIC_TYPES -contains $type) {
        return $v   # unquoted number
    }
    return "'" + $v.Replace("'", "''") + "'"
}

# Parse one CSV line into fields, handling quoted values
function Parse-CsvLine($line) {
    $fields = [System.Collections.Generic.List[string]]::new()
    $field  = [System.Text.StringBuilder]::new()
    $inQ    = $false
    for ($i = 0; $i -lt $line.Length; $i++) {
        $c = $line[$i]
        if ($c -eq '"') {
            if ($inQ -and $i+1 -lt $line.Length -and $line[$i+1] -eq '"') {
                [void]$field.Append('"'); $i++
            } else { $inQ = !$inQ }
        } elseif ($c -eq ',' -and -not $inQ) {
            $fields.Add($field.ToString()); [void]$field.Clear()
        } else { [void]$field.Append($c) }
    }
    $fields.Add($field.ToString())
    return $fields.ToArray()
}

# Build and run ij export script
$ijScript = "connect 'jdbc:derby:$DB_PATH';`n"
foreach ($t in $TABLES) {
    $csv = "$TMP\$t.csv"
    $ijScript += "CALL SYSCS_UTIL.SYSCS_EXPORT_TABLE('APP','$t','$csv',',','""','UTF-8');`n"
}
$ijScript += "exit;`n"

Write-Host "Exporting tables from Derby..." -ForegroundColor Cyan
$ijScript | java -cp $CP org.apache.derby.tools.ij | Out-Null

# Build SQL output
$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add("-- =============================================================")
$lines.Add("-- data-derby.sql - Auto-generated DB snapshot")
$lines.Add("-- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
$lines.Add("-- Executed automatically on app startup.")
$lines.Add("-- Inserts are idempotent (WHERE NOT EXISTS guards).")
$lines.Add("-- =============================================================")
$lines.Add("")
$lines.Add("SELECT 1 FROM SYSIBM.SYSDUMMY1;")
$lines.Add("")

foreach ($t in $TABLES) {
    $csv = "$TMP\$t.csv"
    if (-not (Test-Path $csv) -or (Get-Item $csv).Length -eq 0) {
        $lines.Add("-- $t : (empty)"); $lines.Add(""); continue
    }

    $cols    = $COLUMNS[$t]
    $keyCol  = $UNIQUE_KEY[$t]
    $keyIdx  = [array]::IndexOf($cols, $keyCol)
    $colList = $cols -join ", "
    $rawRows = [System.IO.File]::ReadAllLines($csv, [System.Text.Encoding]::UTF8)
    $count   = 0

    foreach ($row in $rawRows) {
        if ([string]::IsNullOrWhiteSpace($row)) { continue }
        $vals    = Parse-CsvLine $row
        $valList = for ($i = 0; $i -lt $cols.Count; $i++) {
            $raw = if ($i -lt $vals.Count) { $vals[$i] } else { "" }
            Sql-Val $cols[$i] $raw
        }
        $keyRaw    = if ($keyIdx -lt $vals.Count) { $vals[$keyIdx] } else { "" }
        $keyValSql = Sql-Val $keyCol $keyRaw
        $lines.Add("INSERT INTO $t ($colList)")
        $lines.Add("SELECT $($valList -join ', ') FROM SYSIBM.SYSDUMMY1")
        $lines.Add("WHERE NOT EXISTS (SELECT 1 FROM $t WHERE $keyCol = $keyValSql);")
        $count++
    }
    $lines.Add("-- $t : $count row(s)")
    $lines.Add("")
}

[System.IO.File]::WriteAllLines($OUT, $lines, [System.Text.Encoding]::ASCII)
Remove-Item -Recurse -Force $TMP -ErrorAction SilentlyContinue
Write-Host "Done. Snapshot written to $OUT" -ForegroundColor Green
