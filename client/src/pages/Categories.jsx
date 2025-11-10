
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/api/axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };
  
  const openDialog = (category = null) => {
    setEditingCategory(category);
    setCategoryName(category ? category.name : '');
    setIsDialogOpen(true);
  };
  
  const closeDialog = () => {
    setEditingCategory(null);
    setCategoryName('');
    setIsDialogOpen(false);
  };

  const handleSave = async () => {
    if (!categoryName) {
      toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    
    const method = editingCategory ? 'put' : 'post';
    const url = editingCategory ? `/api/categories/${editingCategory.id}/` : '/api/categories/';

    try {
      const response = await axiosInstance[method](url, { name: categoryName });
      if (editingCategory) {
        setCategories(categories.map(cat => cat.id === editingCategory.id ? response.data : cat));
        toast({ title: "Success", description: "Category updated!" });
      } else {
        setCategories([...categories, response.data]);
        toast({ title: "Success", description: "Category added!" });
      }
      closeDialog();
    } catch (error) {
      console.error("Failed to save category", error);
      toast({ title: "Error", description: "Failed to save category.", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/categories/${id}/`);
      setCategories(categories.filter(cat => cat.id !== id));
      toast({ title: "Success", description: "Category deleted." });
    } catch (error) {
      console.error("Failed to delete category", error);
      toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" });
    }
  };
  

  return (
    <>
      <Helmet>
        <title>Category Management - CDD System</title>
      </Helmet>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Category Management
              </h1>
              <p className="text-gray-600 mt-2">Group your assessment questions</p>
            </div>
            <Button onClick={() => openDialog()} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </div>

          <div className="grid gap-4">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <p className="font-semibold text-lg text-slate-800">{cat.name}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openDialog(cat)}><Edit className="w-4 h-4"/></Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input 
                    id="categoryName" 
                    value={categoryName} 
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g., Client Identification" 
                  />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                    <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-indigo-600">Save</Button>
                </DialogFooter>
              </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </>
  );
};

export default Categories;
