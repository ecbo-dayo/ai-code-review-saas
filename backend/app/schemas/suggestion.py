from pydantic import BaseModel
from typing import Literal


class SuggestionRequest(BaseModel):
    # 何の提案がほしいか
    type: Literal["issue", "complexity", "refactor"]
    # 対象コード（全タイプで使う）
    code: str
    # issueタイプのとき使う（複雑度・リファクタでは空でOK）
    category: str = ""
    problem: str = ""
    # 複雑度タイプのとき使う
    complexity: float = 0


class SuggestionResponse(BaseModel):
    suggestion: str        # 改善案テキスト（AIが生成、今はモック）
    isMock: bool = True    # モックかどうかの目印（後で本番化したらFalse）