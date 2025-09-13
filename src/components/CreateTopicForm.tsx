import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';

interface CreateTopicFormProps {
    onSubmit: (title: string, description: string) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const CreateTopicForm: React.FC<CreateTopicFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;
        
        await onSubmit(title.trim(), description.trim());
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/90 shadow-xl"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">创建新话题</h2>
                <button
                    onClick={onCancel}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        话题标题 *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="输入话题标题..."
                        className="w-full bg-white/85 border border-gray-300 rounded-xl px-4 py-3 text-slate-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/90"
                        maxLength={100}
                        disabled={isSubmitting}
                        required
                    />
                    <div className="text-right text-sm text-slate-500 mt-1">
                        {title.length}/100
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        话题描述 *
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="详细描述这个话题的内容和讨论方向..."
                        className="w-full bg-white/85 border border-gray-300 rounded-xl px-4 py-3 text-slate-800 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/90"
                        rows={4}
                        maxLength={500}
                        disabled={isSubmitting}
                        required
                    />
                    <div className="text-right text-sm text-slate-500 mt-1">
                        {description.length}/500
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
                        disabled={isSubmitting}
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !title.trim() || !description.trim()}
                        className="flex-1 bg-blue-600/90 backdrop-blur-sm border border-blue-700/90 hover:bg-blue-700/95 disabled:bg-gray-400/90 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                        {isSubmitting ? '创建中...' : '创建话题'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default CreateTopicForm;