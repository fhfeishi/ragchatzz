from fastapi import APIRouter, Request, Query
from fastapi.responses import HTMLResponse, StreamingResponse
from src.services.chatflow_service import ChatFlowService
# from sse_starlette.sse import EventSourceResponse

router = APIRouter()

# 全局共享服务实例
chat_service = ChatFlowService()

@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return request.app.state.templates.TemplateResponse("home.html", {"request": request})

@router.get("/chat", response_class=HTMLResponse)
async def chat_page(request: Request):
    return request.app.state.templates.TemplateResponse("chat.html", {"request": request})



@router.get("/api/chat/stream")
async def stream_chat(question: str = Query(..., description="用户问题")):
    async def event_stream():
        try:
            for token in chat_service.sse_stream(question):
                yield str(token)   # <- 必须是 str / bytes，带两次换行
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"
            yield "data: [END]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
    