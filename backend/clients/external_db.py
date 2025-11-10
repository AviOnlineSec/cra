from typing import List, Dict, Optional, Any
from django.conf import settings


def is_external_db_enabled() -> bool:
    cfg = getattr(settings, "EXTERNAL_DB", {})
    return bool(cfg.get("ENABLED"))


def get_connection():
    """Return a PyMySQL connection if available and config is enabled, else None."""
    if not is_external_db_enabled():
        return None
    try:
        import pymysql  # Optional dependency
    except ImportError:
        return None

    cfg = settings.EXTERNAL_DB
    if not all([cfg.get("HOST"), cfg.get("NAME"), cfg.get("USER")]):
        return None

    return pymysql.connect(
        host=cfg["HOST"],
        user=cfg["USER"],
        password=cfg.get("PASSWORD", ""),
        database=cfg["NAME"],
        port=int(cfg.get("PORT", 3306)),
        cursorclass=None,
        autocommit=True,
    )


def fetch_external_clients(limit: int = 50, query: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch clients from the external DB using a SELECT query.

    Returns a list of dicts with keys matching the selected columns.
    """
    conn = get_connection()
    if conn is None:
        return []

    q = query or settings.EXTERNAL_DB.get("CLIENTS_QUERY")
    rows: List[Dict[str, Any]] = []
    try:
        with conn.cursor() as cur:
            # Using parameter for limit to avoid SQL injection
            cur.execute(q, (limit,))
            columns = [desc[0] for desc in cur.description]
            for row in cur.fetchall():
                rows.append({col: val for col, val in zip(columns, row)})
    finally:
        conn.close()
    return rows


def push_results_to_external(table: Optional[str], payload: Dict[str, Any]) -> bool:
    """Push results into an external table. Returns True if write succeeded.

    This expects a generic JSON payload; columns are inferred from keys.
    """
    conn = get_connection()
    if conn is None:
        return False

    table_name = table or settings.EXTERNAL_DB.get("RESULTS_TABLE") or "assessment_results"
    keys = list(payload.keys())
    placeholders = ",".join(["%s"] * len(keys))
    columns = ",".join([f"`{k}`" for k in keys])
    values = [payload[k] for k in keys]

    sql = f"INSERT INTO `{table_name}` ({columns}) VALUES ({placeholders})"
    try:
        with conn.cursor() as cur:
            cur.execute(sql, values)
        return True
    except Exception:
        return False
    finally:
        conn.close()