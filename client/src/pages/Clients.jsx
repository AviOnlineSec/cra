import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axios";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, User, Trash2, Edit, Play } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";

const initialFormData = {
  clientType: "individual",
  distributionChannel: "HeadOffice",
  fullName: "",
  nationalId: "",
  corporateName: "",
  ubo: "",
  natureOfBusiness: "",
  brn: "",
  vat: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  
};

// ------------------------------
// 🟩 Client Form
// ------------------------------
const ClientForm = ({ formData, setFormData, initialFormData }) => (
  <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>Client Type</Label>
        <Select
          value={formData.clientType}
          onValueChange={(value) =>
            setFormData({
              ...initialFormData,
              clientType: value,
              distributionChannel: formData.distributionChannel,
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Distribution Channel</Label>
        <Select
          value={formData.distributionChannel}
          onValueChange={(value) =>
            setFormData({ ...formData, distributionChannel: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HeadOffice">Head Office</SelectItem>
            <SelectItem value="Broker">Broker</SelectItem>
            <SelectItem value="Agent">Agent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="pt-4 border-t">
      {formData.clientType === "individual" ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-slate-700">
            Individual Details
          </h3>
          <div>
            <Label>Full Name</Label>
            <Input
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>
          <div>
            <Label>National ID</Label>
            <Input
              value={formData.nationalId}
              onChange={(e) =>
                setFormData({ ...formData, nationalId: e.target.value })
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-slate-700">
            Corporate Details
          </h3>
          <div>
            <Label>Corporate Name</Label>
            <Input
              value={formData.corporateName}
              onChange={(e) =>
                setFormData({ ...formData, corporateName: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Ultimate Beneficial Owner (UBO)</Label>
            <Input
              value={formData.ubo}
              onChange={(e) =>
                setFormData({ ...formData, ubo: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Nature of Business</Label>
            <Input
              value={formData.natureOfBusiness}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  natureOfBusiness: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>BRN</Label>
              <Input
                value={formData.brn}
                onChange={(e) =>
                  setFormData({ ...formData, brn: e.target.value })
                }
              />
            </div>
            <div>
              <Label>VAT</Label>
              <Input
                value={formData.vat}
                onChange={(e) =>
                  setFormData({ ...formData, vat: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>

    <div className="pt-4 border-t">
      <h3 className="font-semibold text-lg text-slate-700">
        Contact Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
      </div>
      <div className="mt-4">
        <Label>Address</Label>
        <Input
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />
      </div>
      <div className="mt-4">
        <Label>City</Label>
        <Input
          value={formData.city}
          onChange={(e) =>
            setFormData({ ...formData, city: e.target.value })
          }
        />
      </div>
    </div>
  </div>
);

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ------------------------------
  // 🟩 Load clients from backend
  // ------------------------------
  const loadClients = async () => {
    try {
      const res = await axiosInstance.get("/api/clients/");
      setClients(res.data);
    } catch (err) {
      console.error("Error loading clients:", err);
      toast({
        title: "Error",
        description: "Failed to load clients. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) loadClients();
  }, [user]);

  // ------------------------------
  // 🟩 Save new client
  // ------------------------------
  const handleSave = async () => {
    try {
      const res = await axiosInstance.post("/api/clients/", formData);
      setClients([...clients, res.data]);
      setIsDialogOpen(false);
      setFormData(initialFormData);

      toast({
        title: "Success",
        description: "Client added successfully.",
      });
    } catch (err) {
      console.error("Save client error:", err);
      toast({
        title: "Error",
        description: "Failed to add client.",
        variant: "destructive",
      });
    }
  };

  // ------------------------------
  // 🟩 Delete client
  // ------------------------------
  const handleDelete = async (clientId) => {
    try {
      await axiosInstance.delete(`/api/clients/${clientId}/`);
      setClients(clients.filter((c) => c.id !== clientId));

      toast({
        title: "Deleted",
        description: "Client deleted successfully.",
      });
    } catch (err) {
      console.error("Delete client error:", err);
      toast({
        title: "Error",
        description: "Failed to delete client.",
        variant: "destructive",
      });
    }
  };

  const handleStartAssessment = (clientId) => {
    navigate(`/assessment/${clientId}`);
  };

  const handleEdit = (client) => {
    toast({
      title: "Edit Client",
      description:
        "🚧 This feature isn't implemented yet — but it can be added easily!",
    });
  };

  

  // ------------------------------
  // 🟩 UI Rendering
  // ------------------------------
  return (
    <>
      <Helmet>
        <title>Clients - CDD System</title>
        <meta
          name="description"
          content="Manage clients and initiate risk assessments"
        />
      </Helmet>

      <Layout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Client Management
              </h1>
              <p className="text-gray-600 mt-2">
                Add and manage client information
              </p>
            </div>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(isOpen) => {
                setIsDialogOpen(isOpen);
                if (!isOpen) setFormData(initialFormData);
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <ClientForm
                  formData={formData}
                  setFormData={setFormData}
                  initialFormData={initialFormData}
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    Save Client
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Reference</th>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Client Type</th>
                        <th className="px-6 py-3">Created By</th>
                        <th className="px-6 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((client) => (
                        <tr
                          key={client.id}
                          className="bg-white border-b hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {client.reference}
                          </td>
                          <td className="px-6 py-4">
                            {client.fullName || client.corporateName}
                          </td>
                          <td className="px-6 py-4">{client.email}</td>
                          <td className="px-6 py-4 capitalize">
                            {client.clientType === 'individual' ? 'Individual' : 'Corporate'}
                          </td>
                          <td className="px-6 py-4">
                            {client.created_by_name || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() =>
                                  handleStartAssessment(client.id)
                                }
                              >
                                <Play className="w-4 h-4 mr-1" /> Start
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-800"
                                onClick={() => handleEdit(client)}
                              >
                                <Edit className="w-4 h-4 mr-1" /> Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDelete(client.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" /> Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {clients.length === 0 && (
                  <div className="text-center py-12">
                    <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">
                      No clients yet. Add your first client to get started!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    </>
  );
};

export default Clients;

