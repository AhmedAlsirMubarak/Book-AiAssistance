<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentConversation extends Model
{
    protected $table = 'agent_conversation_messages';

    protected $fillable = ['conversation_id','role','message','id','user_id',
     'content', 'attachment', 'tool_calls','tool_results','usage','meta'];

    public $incrementing = false;

}


