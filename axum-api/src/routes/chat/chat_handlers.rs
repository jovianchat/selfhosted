use std::sync::{Arc, RwLock};

use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;

use crate::{
    http::AppState,
    models::{
        cache::append_to_cached_chat,
        chat::{Chat, ChatMessage},
    },
    Result,
};

pub async fn get_chat(
    Path(chat_id): Path<Uuid>,
    State(state): State<AppState>,
) -> Result<Json<Arc<RwLock<Chat>>>> {
    let chat = Chat::fetch_chat(&chat_id, &state.cache, &state.pg_pool).await?;

    Ok(Json(chat))
}
// #[axum::debug_handler] // very useful for debugging
pub async fn append_chat(
    Path(chat_id): Path<Uuid>,
    State(state): State<AppState>,
    Json(payload): Json<Vec<ChatMessage>>,
) -> Result<StatusCode> {
    let pool = &state.pg_pool;

    sqlx::query!(
        r#"INSERT INTO ai.chat_messages (chat_id, id, role, content, created_at) VALUES ($1, $2, $3, $4, $5), ($1, $6, $7, $8, $9)"#,
        chat_id,
        payload[0].id,
        payload[0].role,
        payload[0].content,
        payload[0].created_at,
        payload[1].id,
        payload[1].role,
        payload[1].content,
        payload[1].created_at
    )
    .execute(pool)
    .await?;

    // Moka cache append
    let _ = append_to_cached_chat(&state.cache, &chat_id, payload, pool).await;

    Ok(StatusCode::OK)
}
pub async fn rename_chat(
    State(state): State<AppState>,
    Path(chat_id): Path<uuid::Uuid>,
    title: String,
) -> Result<StatusCode> {
    let pool = &state.pg_pool;
    sqlx::query!(
        r#"UPDATE ai.chats SET title = $1 WHERE id = $2"#,
        title,
        chat_id
    )
    .execute(pool)
    .await?;

    // Moka cache invalidate
    let _ = state.cache.chat.invalidate(&chat_id).await;
    let _ = state.cache.chat_history.invalidate(&state.user).await;

    Ok(StatusCode::OK)
}
pub async fn delete_chat(
    State(state): State<AppState>,
    Path(chat_id): Path<uuid::Uuid>,
) -> Result<StatusCode> {
    let pool = &state.pg_pool;
    sqlx::query!(r#"DELETE FROM ai.chats WHERE id = $1"#, chat_id)
        .execute(pool)
        .await?;

    // Moka cache invalidate
    let _ = state.cache.chat.invalidate(&chat_id).await;
    let _ = state.cache.chat_history.invalidate(&state.user).await;

    Ok(StatusCode::OK)
}

pub async fn star_chat(
    State(state): State<AppState>,
    Path(chat_id): Path<uuid::Uuid>,
) -> Result<StatusCode> {
    let pool = &state.pg_pool;
    sqlx::query!(
        r#"UPDATE ai.chats SET starred = NOT starred WHERE id = $1"#,
        chat_id
    )
    .execute(pool)
    .await?;

    // Moka cache invalidate
    let _ = state.cache.chat_history.invalidate(&state.user).await;
    let _ = state.cache.chat.invalidate(&chat_id).await;

    Ok(StatusCode::OK)
}
