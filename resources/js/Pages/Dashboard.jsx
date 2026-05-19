import {Head} from '@inertiajs/react';
import {PlaceholderPattern} from '@/Components/ui/PlaceholderPattern-pattern';
impprt AppLayout from '@/Layouts/AppLayout';

import React, { useState, useRef, useEffect } from 'react';
import {Button} from '@/Components/ui/Button';
import {Input} from '@/Components/ui/Input';
import {MessageCircle, X, Send, User, Bot } from 'lucide-react';

interface Message {
    role:user | 'assistant';
    conternt:string;
}

export default function Dashboard() {
    const [isOen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
    {role: 'assistant', content "Hi there! I'm your Book Shop Assistant. How can I help you today?"},
    ]);
    const [input, setInput] = useState('');
    const [isloading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    //Simple message formatter (support **bold** and new lines)
    const formatMessage = (message:string) => {
        let formatted = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\n/g, '<br/>');
        return formatted;
    };

    // Auto - scroll to the bottom when new messages arrive

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim()) return;
   