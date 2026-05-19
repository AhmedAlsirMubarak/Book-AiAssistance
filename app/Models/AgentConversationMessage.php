<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgentConversationMessage extends Model
{
    protected $table = 'agent_conversation_messages';

    protected $fillable = ['id','user_id','title'];

    public $incrementing = false;

    public function messages():hasMany
    {
        return $this->hasMany(AgentConversationMessage::class, 'conversation_id', 'id');
    }
}
