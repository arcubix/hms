import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Droplet, User, Calendar, Clock, AlertTriangle, FileText, Stethoscope, Package } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface RequestBloodProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientData?: {
    id: string;
    name: string;
    mrn: string;
    bloodGroup: string;
    age: number;
    gender: string;
    department?: string;
  };
}

const bloodProducts = [
  { value: "whole_blood", label: "Whole Blood" },
  { value: "packed_rbc", label: "Packed Red Blood Cells (PRBC)" },
  { value: "platelets", label: "Platelets" },
  { value: "fresh_frozen_plasma", label: "Fresh Frozen Plasma (FFP)" },
  { value: "cryoprecipitate", label: "Cryoprecipitate" },
  { value: "platelet_concentrate", label: "Platelet Concentrate" },
  { value: "granulocytes", label: "Granulocytes" },
  { value: "plasma", label: "Plasma" }
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const urgencyLevels = [
  { value: "emergency", label: "Emergency (Immediate)", color: "bg-red-500" },
  { value: "urgent", label: "Urgent (Within 2 hours)", color: "bg-orange-500" },
  { value: "routine", label: "Routine (Within 24 hours)", color: "bg-blue-500" },
  { value: "scheduled", label: "Scheduled", color: "bg-green-500" }
];

export function RequestBloodProductDialog({ open, onOpenChange, patientData }: RequestBloodProductDialogProps) {
  const [formData, setFormData] = useState({
    productType: "",
    bloodGroup: patientData?.bloodGroup || "",
    quantity: "",
    unit: "units",
    urgency: "",
    indication: "",
    clinicalDiagnosis: "",
    requestingDoctor: "",
    department: patientData?.department || "Emergency",
    contactNumber: "",
    requiredBy: "",
    specialInstructions: "",
    crossMatchRequired: "yes"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.productType) {
      toast.error("Please select a blood product");
      return;
    }
    if (!formData.bloodGroup) {
      toast.error("Please select blood group");
      return;
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    if (!formData.urgency) {
      toast.error("Please select urgency level");
      return;
    }
    if (!formData.indication) {
      toast.error("Please provide indication for transfusion");
      return;
    }
    if (!formData.requestingDoctor) {
      toast.error("Please enter requesting doctor name");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const requestId = `BR${Date.now().toString().slice(-6)}`;
      
      toast.success(
        <div>
          <p className="font-semibold">Blood Product Request Submitted</p>
          <p className="text-sm mt-1">Request ID: {requestId}</p>
          <p className="text-sm">Blood Bank will process your request</p>
        </div>
      );

      setIsSubmitting(false);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        productType: "",
        bloodGroup: patientData?.bloodGroup || "",
        quantity: "",
        unit: "units",
        urgency: "",
        indication: "",
        clinicalDiagnosis: "",
        requestingDoctor: "",
        department: patientData?.department || "Emergency",
        contactNumber: "",
        requiredBy: "",
        specialInstructions: "",
        crossMatchRequired: "yes"
      });
    }, 1500);
  };

  const selectedUrgency = urgencyLevels.find(u => u.value === formData.urgency);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-red-600" />
            </div>
            Request Blood Products
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Fill out the form below to request blood products for your patient.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          {patientData && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="flex items-center gap-2 mb-3 text-blue-900">
                <User className="w-4 h-4" />
                Patient Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-blue-600">MRN</p>
                  <p className="text-blue-900">{patientData.mrn}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Patient Name</p>
                  <p className="text-blue-900">{patientData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Age / Gender</p>
                  <p className="text-blue-900">{patientData.age}Y / {patientData.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Blood Group</p>
                  <Badge className="bg-red-600 hover:bg-red-700">
                    {patientData.bloodGroup}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Blood Product Details */}
          <div className="border rounded-lg p-4">
            <h3 className="flex items-center gap-2 mb-4 text-gray-900">
              <Package className="w-4 h-4 text-[#2F80ED]" />
              Blood Product Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Type */}
              <div className="space-y-2">
                <Label htmlFor="productType" className="flex items-center gap-1">
                  Blood Product Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.productType} onValueChange={(value) => handleInputChange("productType", value)}>
                  <SelectTrigger id="productType">
                    <SelectValue placeholder="Select blood product" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodProducts.map((product) => (
                      <SelectItem key={product.value} value={product.value}>
                        {product.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Blood Group */}
              <div className="space-y-2">
                <Label htmlFor="bloodGroup" className="flex items-center gap-1">
                  Blood Group <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange("bloodGroup", value)}>
                  <SelectTrigger id="bloodGroup">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="flex items-center gap-1">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    placeholder="Enter quantity"
                    className="flex-1"
                  />
                  <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="units">Units</SelectItem>
                      <SelectItem value="ml">ML</SelectItem>
                      <SelectItem value="bags">Bags</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cross Match Required */}
              <div className="space-y-2">
                <Label htmlFor="crossMatch" className="flex items-center gap-1">
                  Cross Match Required <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.crossMatchRequired} onValueChange={(value) => handleInputChange("crossMatchRequired", value)}>
                  <SelectTrigger id="crossMatch">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No (Type & Screen)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Urgency & Scheduling */}
          <div className="border rounded-lg p-4">
            <h3 className="flex items-center gap-2 mb-4 text-gray-900">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              Urgency & Scheduling
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Urgency Level */}
              <div className="space-y-2">
                <Label htmlFor="urgency" className="flex items-center gap-1">
                  Urgency Level <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                  <SelectTrigger id="urgency">
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${level.color}`} />
                          {level.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedUrgency && (
                  <Badge className={`${selectedUrgency.color} text-white`}>
                    {selectedUrgency.label}
                  </Badge>
                )}
              </div>

              {/* Required By */}
              <div className="space-y-2">
                <Label htmlFor="requiredBy" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Required By (Date & Time)
                </Label>
                <Input
                  id="requiredBy"
                  type="datetime-local"
                  value={formData.requiredBy}
                  onChange={(e) => handleInputChange("requiredBy", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Clinical Information */}
          <div className="border rounded-lg p-4">
            <h3 className="flex items-center gap-2 mb-4 text-gray-900">
              <FileText className="w-4 h-4 text-[#27AE60]" />
              Clinical Information
            </h3>
            
            <div className="space-y-4">
              {/* Indication for Transfusion */}
              <div className="space-y-2">
                <Label htmlFor="indication" className="flex items-center gap-1">
                  Indication for Transfusion <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="indication"
                  value={formData.indication}
                  onChange={(e) => handleInputChange("indication", e.target.value)}
                  placeholder="Enter the clinical indication for blood transfusion (e.g., acute blood loss, severe anemia, pre-operative preparation)"
                  rows={3}
                />
              </div>

              {/* Clinical Diagnosis */}
              <div className="space-y-2">
                <Label htmlFor="clinicalDiagnosis">
                  Clinical Diagnosis
                </Label>
                <Textarea
                  id="clinicalDiagnosis"
                  value={formData.clinicalDiagnosis}
                  onChange={(e) => handleInputChange("clinicalDiagnosis", e.target.value)}
                  placeholder="Enter patient's clinical diagnosis"
                  rows={2}
                />
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="specialInstructions">
                  Special Instructions
                </Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                  placeholder="Any special requirements (e.g., irradiated, CMV negative, leukoreduced)"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Requesting Doctor Information */}
          <div className="border rounded-lg p-4">
            <h3 className="flex items-center gap-2 mb-4 text-gray-900">
              <Stethoscope className="w-4 h-4 text-[#2F80ED]" />
              Requesting Doctor Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctor Name */}
              <div className="space-y-2">
                <Label htmlFor="requestingDoctor" className="flex items-center gap-1">
                  Doctor Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="requestingDoctor"
                  value={formData.requestingDoctor}
                  onChange={(e) => handleInputChange("requestingDoctor", e.target.value)}
                  placeholder="Enter doctor's name"
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">
                  Department
                </Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  placeholder="Enter department"
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contactNumber">
                  Contact Number
                </Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                  placeholder="Enter contact number for urgent communication"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#2F80ED] hover:bg-[#2F80ED]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Droplet className="w-4 h-4 mr-2" />
                  Submit Blood Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}