
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/api/axios';

const initialFormData = {
  category_id: "",
  question_text: "",
  field_type: "select",
  display_order: 0,
};

const initialOptions = [{ option_text: "", score_value: 0 }];

const QuestionForm = ({ question, isOpen, categories = [], onClose, onSaved }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [options, setOptions] = useState(initialOptions);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (question) {
      setFormData({
        category_id: question.category_id,
        question_text: question.question_text,
        field_type: question.field_type,
        display_order: question.display_order || 0,
      });
      setOptions(question.options && question.options.length > 0 ? question.options : initialOptions);
    } else {
      // Reset on dialog open when adding a new question
      setFormData(initialFormData);
      setOptions(initialOptions);
    }
  }, [question, isOpen]);

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = field === "score_value" ? parseInt(value) || 0 : value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, { option_text: "", score_value: 0 }]);
  const removeOption = (index) => setOptions(options.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.category_id || !formData.question_text) {
        toast({title: "Error", description: "Category and Question Text are required.", variant: "destructive"});
        return;
    }
    
    const savedQuestion = { ...formData, options };
    onSaved(savedQuestion);
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{question ? "Edit Question" : "Add New Question"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
        <div>
          <Label>Category *</Label>
          <Select required value={String(formData.category_id)} onValueChange={(val) => setFormData({ ...formData, category_id: Number(val) })}>
            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
            <SelectContent>
              {categories.map((cat) => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Question Text *</Label>
          <Input required value={formData.question_text} onChange={(e) => setFormData({ ...formData, question_text: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Field Type</Label>
            <Select value={formData.field_type} onValueChange={(val) => setFormData({ ...formData, field_type: val })}>
              <SelectTrigger><SelectValue placeholder="Select field type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="radio">Radio</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Display Order</Label>
            <Input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Answer Options</Label>
            <Button type="button" variant="outline" size="sm" onClick={addOption}><Plus size={16} className="mr-1" /> Add Option</Button>
          </div>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input placeholder="Option text" value={option.option_text} onChange={(e) => handleOptionChange(index, "option_text", e.target.value)} />
                <Input className="w-24" type="number" placeholder="Score" value={option.score_value} onChange={(e) => handleOptionChange(index, "score_value", e.target.value)} />
                {options.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}><Trash2 className="text-red-500" size={16} /></Button>}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">Save Question</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};


const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [questionsResponse, categoriesResponse] = await Promise.all([
        axiosInstance.get('/api/questions/'),
        axiosInstance.get('/api/categories/')
      ]);
      const normalizedQuestions = (questionsResponse.data || []).map(q => ({
        ...q,
        category_id: q.category ?? q.category_id,
      }));
      setQuestions(normalizedQuestions);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };
  
  const openDialog = (question = null) => {
    setEditingQuestion(question);
    setIsDialogOpen(true);
  };


  const closeDialog = () => {
    setEditingQuestion(null);
    setIsDialogOpen(false);
  };

  const handleSave = async (savedQuestion) => {
    const method = editingQuestion ? 'put' : 'post';
    const url = editingQuestion ? `/api/questions/${editingQuestion.id}/` : '/api/questions/';

    try {
      // Remove read-only fields (like 'id') from options before sending
      const cleanedOptions = (savedQuestion.options || []).map(opt => ({
        option_text: opt.option_text,
        score_value: typeof opt.score_value === 'number' ? opt.score_value : parseInt(opt.score_value) || 0,
      }));
      const payload = {
        category: savedQuestion.category_id,
        question_text: savedQuestion.question_text,
        field_type: savedQuestion.field_type,
        display_order: savedQuestion.display_order,
        options: cleanedOptions,
      };
      const response = await axiosInstance[method](url, payload);
      const normalized = { ...response.data, category_id: response.data.category };
      if (editingQuestion) {
        setQuestions(questions.map(q => q.id === editingQuestion.id ? normalized : q));
        toast({ title: "Success", description: "Question updated!" });
      } else {
        setQuestions([...questions, normalized]);
        toast({ title: "Success", description: "Question added!" });
      }
      closeDialog();
    } catch (error) {
      console.error("Failed to save question", error);
      toast({ title: "Error", description: "Failed to save question.", variant: "destructive" });
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/questions/${id}/`);
      setQuestions(questions.filter(q => q.id !== id));
      toast({ title: "Success", description: "Question deleted." });
    } catch (error) {
      console.error("Failed to delete question", error);
      toast({ title: "Error", description: "Failed to delete question.", variant: "destructive" });
    }
  }

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || "Uncategorized";

  return (
    <>
      <Helmet>
        <title>Question Management - CDD System</title>
      </Helmet>
      <Layout>
        <div className="space-y-6">
           <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Question Management
              </h1>
              <p className="text-gray-600 mt-2">Create and manage assessment questions</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Plus className="w-4 h-4 mr-2" /> Add Question
                </Button>
              </DialogTrigger>
              <QuestionForm question={editingQuestion} isOpen={isDialogOpen} categories={categories} onClose={closeDialog} onSaved={handleSave} />
            </Dialog>
          </div>
          
          <div className="space-y-4">
            {categories.map(category => {
                const categoryQuestions = questions.filter(q => q.category_id === category.id);
                if (categoryQuestions.length === 0) return null;

                return (
                    <div key={category.id}>
                        <h2 className="text-2xl font-semibold text-slate-700 mb-3 border-b-2 border-blue-500 pb-2">{category.name}</h2>
                         <div className="grid gap-4">
                            {categoryQuestions.sort((a,b) => a.display_order - b.display_order).map((q, index) => (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="hover:shadow-lg transition-all border-0 bg-white/80 backdrop-blur-sm">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <p className="font-medium text-slate-800">{q.question_text}</p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="icon" onClick={() => openDialog(q)}><Edit className="w-4 h-4"/></Button>
                                                <Button variant="outline" size="icon" onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                         </div>
                    </div>
                )
            })}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Questions;
