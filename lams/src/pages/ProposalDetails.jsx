import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Eye,
  ChevronLeft,
  Download,
  Check,
  Edit3,
  Trash2,
  MessageSquare,
  ExternalLink,
  Share2,
  Activity,
  Landmark,
  FileText,
  Users,
  Map,
  CheckCircle,
  ShieldCheck,
  Clock,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Tooltip as LeafletTooltip,
  Marker,
  Popup,
} from "react-leaflet";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  alpha,
  useTheme,
  Grid,
  Badge,
  Breadcrumbs,
  Link,
} from "@mui/material";
import ClayButton from "../components/ui/ClayButton";
import StatusBadge from "../components/ui/StatusBadge";
import Timeline from "../components/common/Timeline";
import { proposalApi, parcelApi, documentApi, getFileWithErrorMessage } from "../services";
import { useAuth } from "../auth/AuthContext";
import { formatDate, formatCurrency, formatArea } from "../utils/formatters";

const TIMELINE_STAGES = [
  {
    id: "submitted",
    label: "Proposal Submitted",
    description: "Initial proposal submitted with required documentation",
  },
  {
    id: "field_verification",
    label: "Field Verification",
    description: "Verification of documents and field data by Field Officer",
  },
  {
    id: "review",
    label: "Administrative Review",
    description: "Review by district administration and concerned departments",
  },
  {
    id: "approved",
    label: "Approved",
    description: "Proposal approved by competent authority",
  },
  {
    id: "notification",
    label: "Notification",
    description: "Public notification issued in Official Gazette",
  },
  {
    id: "award",
    label: "Award Declared",
    description: "Award of land issued to affected families",
  },
  {
    id: "compensation",
    label: "Compensation",
    description: "Compensation amount disbursed to affected families",
  },
  {
    id: "possession",
    label: "Possession",
    description: "Physical possession transferred to acquiring authority",
  },
];

const ProposalDetails = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [proposal, setProposal] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [toast, setToast] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [verifyingDocId, setVerifyingDocId] = useState(null);
  const [rejectingDocId, setRejectingDocId] = useState(null);
  const [docRemarks, setDocRemarks] = useState("");
  const [docActionLoading, setDocActionLoading] = useState(false);
  const [tab, setTab] = useState(0);

  const fetchProposal = async () => {
    setLoading(true);
    try {
      const res = await proposalApi.getById(id);
      setProposal(res.data);
      const parcelsRes = await parcelApi.getByProposal(id);
      setParcels(parcelsRes.data || []);
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error("Failed to fetch proposal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProposal();
  }, [id]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async () => {
    if (!actionType || !remarks.trim()) {
      showToast("Please enter remarks", "error");
      return;
    }

    setActionLoading(true);
    try {
      let res;
      if (actionType === "approve") {
        res = await proposalApi.approve(id, remarks);
      } else if (actionType === "reject") {
        res = await proposalApi.reject(id, remarks);
      } else if (actionType === "request-changes") {
        res = await proposalApi.requestChanges(id, remarks);
      }

      showToast(`Proposal ${actionType}d successfully`);
      setShowActionModal(false);
      setRemarks("");
      setActionType("");
      await fetchProposal();
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/proposals/${id}/edit`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const isSuperAdmin = user?.role === "SUPER_ADMIN";
      const isDraft = proposal?.status === "DRAFT";
      const needsConfirm = !isDraft && isSuperAdmin;
      await proposalApi.delete(id, needsConfirm);
      showToast("Proposal deleted successfully");
      setShowDeleteModal(false);
      navigate("/proposals");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to delete proposal",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleVerifyDocument = async () => {
    if (!verifyingDocId) return;
    setDocActionLoading(true);
    try {
      await documentApi.verify(verifyingDocId, docRemarks);
      showToast("Document verified successfully");
      setShowVerifyModal(false);
      setVerifyingDocId(null);
      setDocRemarks("");
      await fetchProposal();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to verify document",
        "error",
      );
    } finally {
      setDocActionLoading(false);
    }
  };

  const handleRejectDocument = async () => {
    if (!rejectingDocId || !docRemarks.trim()) {
      showToast("Rejection reason is required", "error");
      return;
    }
    setDocActionLoading(true);
    try {
      await documentApi.reject(rejectingDocId, docRemarks);
      showToast("Document rejected");
      setShowRejectModal(false);
      setRejectingDocId(null);
      setDocRemarks("");
      await fetchProposal();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to reject document",
        "error",
      );
    } finally {
      setDocActionLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadFile) return;
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("name", uploadFile.name);
      formData.append("fileName", uploadFile.name);
      formData.append("fileType", uploadFile.type.split("/")[1] || "pdf");
      formData.append("fileSize", String(uploadFile.size));
      formData.append("storagePath", "");
      await documentApi.upload(id, formData);
      showToast("Document uploaded successfully");
      setUploadFile(null);
      await fetchProposal();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to upload document",
        "error",
      );
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleCompleteVerification = async () => {
    setActionLoading(true);
    try {
      await proposalApi.completeVerification(id);
      showToast("Field verification completed");
      await fetchProposal();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to complete verification",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartFieldVerification = async () => {
    setActionLoading(true);
    try {
      await proposalApi.startFieldVerification(id);
      showToast("Field verification started");
      await fetchProposal();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to start field verification",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (type) => {
    setActionType(type);
    setRemarks("");
    setShowActionModal(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box sx={{ height: 40, bgcolor: "action.hover", borderRadius: 3 }} />
        <Box sx={{ height: 300, bgcolor: "action.hover", borderRadius: 4 }} />
        <Box sx={{ height: 200, bgcolor: "action.hover", borderRadius: 4 }} />
      </Box>
    );
  }

  if (!proposal) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          textAlign: "center",
          py: 10,
          px: 4,
          border: (t) =>
            `1px solid ${t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
        }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          Proposal Not Found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          The requested proposal could not be found.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/proposals")}
          startIcon={<ChevronLeft size={18} />}
        >
          Back to Proposals
        </Button>
      </Card>
    );
  }

  const currentPhase = proposal.currentStage || "approved";
  const currentStageId = (() => {
    if (proposal.status === "FIELD_VERIFICATION") return "field_verification";
    return (
      TIMELINE_STAGES.find((s) => s.label === currentPhase)?.id || "approved"
    );
  })();
  const approvalProgress = proposal.progress || 0;
  const approvalCount = proposal.approvals?.length || 0;
  const approvedCount =
    proposal.approvals?.filter((a) => a.action === "APPROVED").length || 0;
  const rejectedCount =
    proposal.approvals?.filter((a) => a.action === "REJECTED").length || 0;
  const pendingCount =
    proposal.approvals?.filter((a) => a.action === "PENDING").length || 0;

  const statusConfig = {
    DRAFT: { label: "DRAFT", color: "warning" },
    SUBMITTED: { label: "SUBMITTED", color: "info" },
    UNDER_REVIEW: { label: "UNDER REVIEW", color: "info" },
    FIELD_VERIFICATION: { label: "FIELD VERIFICATION", color: "info" },
    APPROVED: { label: "APPROVED", color: "success" },
    REJECTED: { label: "REJECTED", color: "error" },
    CHANGES_REQUESTED: { label: "CHANGES REQUESTED", color: "warning" },
    NOTIFICATION_ISSUED: { label: "NOTIFICATION ISSUED", color: "success" },
    AWARD_DECLARED: { label: "AWARD DECLARED", color: "success" },
    COMPENSATION: { label: "COMPENSATION", color: "success" },
    ACQUIRED: { label: "ACQUIRED", color: "success" },
    POSSESSION: { label: "POSSESSION", color: "success" },
  };
  const currentStatus = statusConfig[proposal.status] || {
    label: proposal.status || "PENDING",
    color: "warning",
  };

  const userDepartmentApproval = proposal?.approvals?.find(
    (a) =>
      a.department?.id === user?.departmentId &&
      a.round === proposal?.approvalRound,
  );
  const canApprove =
    proposal?.status === "UNDER_REVIEW" &&
    user?.role === "REVIEWING_AUTHORITY" &&
    userDepartmentApproval?.action === "PENDING";
  const canReject =
    proposal?.status === "UNDER_REVIEW" &&
    hasPermission("PROPOSALS_REJECT") &&
    userDepartmentApproval?.action === "PENDING";
  const canRequestChanges =
    proposal?.status === "UNDER_REVIEW" && hasPermission("PROPOSALS_EDIT");
  const canEdit =
    proposal?.status === "DRAFT" && hasPermission("PROPOSALS_EDIT");
  const canDelete =
    ((proposal?.status === "DRAFT" || proposal?.status === "REJECTED") &&
      proposal?.createdBy?.id === user?.id) ||
    (user?.role === "SUPER_ADMIN" && hasPermission("PROPOSALS_DELETE"));
  const isFieldOfficer = user?.role === "FIELD_OFFICER";
  const canVerifyDocuments =
    isFieldOfficer && hasPermission("DOCUMENTS_VERIFY");
  const canCompleteVerification =
    isFieldOfficer && proposal?.status === "FIELD_VERIFICATION";
  const canStartFieldVerification =
    isFieldOfficer && proposal?.status === "SUBMITTED";

  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                mt: 0.5,
                color: "text.secondary",
                "&:hover": {
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(30,111,255,0.06)",
                },
              }}
            >
              <ChevronLeft size={22} />
            </IconButton>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{
                    letterSpacing: "-0.03em",
                    lineHeight: 1.2,
                    fontSize: {
                      xs: "1.5rem",
                      sm: "1.75rem",
                      md: "2.125rem",
                    },
                    overflowWrap: "anywhere",
                  }}
                >
                  {proposal.proposalNumber}
                </Typography>
                <Chip
                  label={currentStatus.label}
                  color={currentStatus.color}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    fontSize: "0.75rem",
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {proposal.projectName}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {(canEdit || canDelete) && (
              <>
                {canEdit && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Edit3 size={16} />}
                    onClick={handleEdit}
                  >
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<Trash2 size={16} />}
                    onClick={() => setShowDeleteModal(true)}
                  >
                    {proposal?.status === "REJECTED"
                      ? "Drop Proposal"
                      : "Delete"}
                  </Button>
                )}
              </>
            )}
            {canApprove && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<X size={16} />}
                  onClick={() => openActionModal("reject")}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  startIcon={<Check size={16} />}
                  onClick={() => openActionModal("approve")}
                >
                  Approve
                </Button>
              </>
            )}
            {canRequestChanges && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<MessageSquare size={16} />}
                onClick={() => openActionModal("request-changes")}
              >
                Request Changes
              </Button>
            )}
            {canCompleteVerification && (
              <Button
                variant="contained"
                size="small"
                color="success"
                startIcon={<CheckCircle size={16} />}
                onClick={handleCompleteVerification}
                disabled={actionLoading}
              >
                Complete Verification
              </Button>
            )}
            {canStartFieldVerification && (
              <Button
                variant="contained"
                size="small"
                startIcon={<CheckCircle size={16} />}
                onClick={handleStartFieldVerification}
                disabled={actionLoading}
              >
                Start Field Verification
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download size={16} />}
            >
              Export PDF
            </Button>
            <Button
              variant="text"
              size="small"
              startIcon={<Share2 size={16} />}
            >
              Share
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: (t) =>
              `1px solid ${t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
            boxShadow: isDark
              ? "0 4px 24px rgba(0,0,0,0.25)"
              : "0 4px 24px rgba(30,111,255,0.04)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                mb: 2.5,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ letterSpacing: "-0.01em" }}
                >
                  {proposal.status === "REJECTED"
                    ? "Approval Status"
                    : "Department Approval Progress"}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {proposal.status === "REJECTED"
                    ? `Rejected by ${rejectedCount} of ${approvalCount} departments`
                    : `${approvedCount} of ${approvalCount} departments approved`}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ letterSpacing: "-0.03em" }}
                >
                  {approvalProgress}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {proposal.status === "REJECTED" ? "Rejected" : "Complete"}
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={approvalProgress}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 5,
                  background:
                    proposal.status === "REJECTED"
                      ? "linear-gradient(90deg, #EF4444, #DC2626)"
                      : "linear-gradient(90deg, #10B981, #059669)",
                },
              }}
            />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 1.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                Submitted: {formatDate(proposal.submittedDate)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Target: {formatDate(proposal.targetCompletion)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Department Approvals */}
      {(user?.role === "REVIEWING_AUTHORITY" ||
        user?.role === "PROPOSAL_OFFICER" ||
        user?.role === "SUPER_ADMIN") && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: (t) =>
                `1px solid ${t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
              boxShadow: isDark
                ? "0 4px 24px rgba(0,0,0,0.25)"
                : "0 4px 24px rgba(30,111,255,0.04)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  letterSpacing: "-0.01em",
                  mb: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={16} />
                </Box>
                Department Approvals
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {proposal.approvals?.map((approval) => (
                  <Card
                    key={approval.id}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: (t) =>
                        `1px solid ${t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}`,
                      bgcolor: isDark
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(0,0,0,0.01)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor:
                              approval.action === "APPROVED"
                                ? "success.main"
                                : approval.action === "REJECTED"
                                  ? "error.main"
                                  : "warning.main",
                            color: "white",
                          }}
                        >
                          {approval.action === "APPROVED" ? (
                            <Check size={18} />
                          ) : approval.action === "REJECTED" ? (
                            <X size={18} />
                          ) : (
                            <Clock size={18} />
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {approval.department?.name || "Unknown Department"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.3 }}
                          >
                            {approval.action === "APPROVED" &&
                              `Approved by ${approval.reviewer?.name || "Unknown"} on ${formatDate(approval.updatedAt)}`}
                            {approval.action === "REJECTED" &&
                              `Rejected by ${approval.reviewer?.name || "Unknown"} on ${formatDate(approval.updatedAt)}`}
                            {approval.action === "PENDING" && "Pending review"}
                            {approval.action === "CHANGES_REQUESTED" &&
                              `Changes requested by ${approval.reviewer?.name || "Unknown"}`}
                          </Typography>
                          {approval.remarks && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontStyle: "italic",
                                display: "block",
                                mt: 0.3,
                              }}
                            >
                              "{approval.remarks}"
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <StatusBadge
                        status={(approval.action || "pending").toLowerCase()}
                        size="sm"
                      />
                    </Box>
                  </Card>
                ))}
                {(!proposal.approvals || proposal.approvals.length === 0) && (
                  <Box
                    sx={{ textAlign: "center", py: 3, color: "text.secondary" }}
                  >
                    <Typography variant="body2">
                      No department approvals yet
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: (t) =>
              `1px solid ${t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
            boxShadow: isDark
              ? "0 4px 24px rgba(0,0,0,0.25)"
              : "0 4px 24px rgba(30,111,255,0.04)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                letterSpacing: "-0.01em",
                mb: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Activity size={16} />
              </Box>
              Acquisition Timeline
            </Typography>
            <Timeline stages={TIMELINE_STAGES} currentStage={currentStageId} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs for Info, Documents, GIS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: (t) =>
              `1px solid ${t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
            boxShadow: isDark
              ? "0 4px 24px rgba(0,0,0,0.25)"
              : "0 4px 24px rgba(30,111,255,0.04)",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons={false}
            allowScrollButtonsMobile={false}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              px: { xs: 0.5, sm: 2 },
              "& .MuiTab-root": {
                minWidth: {
                  xs: 120,
                  sm: 150,
                },
                fontSize: {
                  xs: "0.75rem",
                  sm: "0.875rem",
                },
              },
            }}
          >
            <Tab label="Project Information" />
            <Tab label={`Documents (${documents.length})`} />
            <Tab label="Land Parcels & GIS" />
          </Tabs>

          {/* Tab 0: Project Information */}
          {tab === 0 && (
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {[
                  {
                    title: "Project Information",
                    icon: Landmark,
                    color: "primary",
                    items: [
                      { label: "Project Name", value: proposal.projectName },
                      { label: "Department", value: proposal.department },
                      { label: "Project Type", value: proposal.projectType },
                      { label: "State", value: proposal.state },
                      { label: "District", value: proposal.district },
                      {
                        label: "Estimated Cost",
                        value: formatCurrency(proposal.estimatedCost),
                      },
                      { label: "Priority", value: proposal.priority },
                    ],
                  },
                  {
                    title: "Land Information",
                    icon: Map,
                    color: "secondary",
                    items: [
                      {
                        label: "Total Area",
                        value: formatArea(proposal.totalLandRequired),
                      },
                      { label: "Parcels", value: parcels.length.toString() },
                      { label: "Land Type", value: proposal.landType },
                      {
                        label: "Approval Progress",
                        value: `${approvalProgress}%`,
                      },
                      {
                        label: "Approvals",
                        value: `${approvedCount} / ${approvalCount} approved`,
                      },
                    ],
                  },
                  {
                    title: "Affected Families",
                    icon: Users,
                    color: "accent",
                    items: [
                      {
                        label: "Affected Families",
                        value:
                          proposal.affectedFamilies?.toLocaleString("en-IN") ||
                          "—",
                      },
                      {
                        label: "Estimated Population",
                        value: proposal.estimatedPopulation
                          ? `≈ ${proposal.estimatedPopulation.toLocaleString("en-IN")}`
                          : "—",
                      },
                      {
                        label: "Population Density",
                        value: proposal.populationDensity
                          ? `${proposal.populationDensity.toLocaleString("en-IN")} people/km²`
                          : "—",
                      },
                      {
                        label: "Displaced Families",
                        value: (
                          Math.round(proposal.affectedFamilies * 0.85) || 0
                        ).toLocaleString("en-IN"),
                      },
                      {
                        label: "Approval Status",
                        value:
                          proposal.status === "APPROVED"
                            ? "Completed"
                            : proposal.status === "REJECTED"
                              ? "Rejected"
                              : "In Progress",
                      },
                      {
                        label: "Departments Approved",
                        value: `${approvedCount} of ${approvalCount}`,
                      },
                    ],
                  },
                ].map((section) => (
                  <Grid item xs={12} md={4} key={section.title}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: (t) =>
                          `1px solid ${t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}`,
                        height: "100%",
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 2,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1.5,
                              bgcolor: `${section.color}.main`,
                              color: "white",
                            }}
                          >
                            <section.icon size={14} />
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {section.title}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                          }}
                        >
                          {section.items.map((item) => (
                            <Box key={item.label}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block" }}
                              >
                                {item.label}
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {item.value || "—"}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          )}

          {/* Tab 1: Documents */}
          {tab === 1 && (
            <CardContent sx={{ p: 3 }}>
              {hasPermission("DOCUMENTS_UPLOAD") && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2.5,
                    border: (t) =>
                      `2px dashed ${t.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
                    borderRadius: 3,
                    bgcolor: isDark
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(0,0,0,0.01)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <input
                      type="file"
                      id="doc-upload"
                      className="hidden"
                      onChange={(e) => setUploadFile(e.target.files[0] || null)}
                    />
                    <label
                      htmlFor="doc-upload"
                      style={{ cursor: "pointer", flex: 1, minWidth: 200 }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {uploadFile
                          ? uploadFile.name
                          : "Choose a file to upload"}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.3 }}
                      >
                        PDF, DOC, DOCX, JPG, PNG — max 10MB
                      </Typography>
                    </label>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleUploadDocument}
                      disabled={!uploadFile || uploadingDoc}
                    >
                      {uploadingDoc ? "Uploading..." : "Upload"}
                    </Button>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {documents.map((doc) => {
                  const statusColor =
                    doc.verificationStatus === "VERIFIED"
                      ? "success"
                      : doc.verificationStatus === "REJECTED"
                        ? "error"
                        : "warning";
                  return (
                    <Card
                      key={doc.id}
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: (t) =>
                          `1px solid ${t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}`,
                        p: 2,
                        transition: "box-shadow 0.2s ease",
                        "&:hover": {
                          boxShadow: isDark
                            ? "0 4px 16px rgba(0,0,0,0.2)"
                            : "0 4px 16px rgba(30,111,255,0.05)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                          }}
                        >
                          <FileText size={20} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            <Typography variant="body2" fontWeight={600}>
                              {doc.name}
                            </Typography>
                            <Chip
                              label={doc.verificationStatus}
                              color={statusColor}
                              size="small"
                              sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            {doc.fileType?.toUpperCase()} ·{" "}
                            {(doc.fileSize / 1024 / 1024).toFixed(1)} MB ·
                            Uploaded by {doc.uploadedBy?.name || "Unknown"}
                          </Typography>
                            <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Tooltip title="Open document">
                                <IconButton
                                  size="small"
                                  aria-label="Open document"
                                  onClick={() => {
                                    getFileWithErrorMessage(doc.id)
                                      .then((blob) => {
                                        const url = URL.createObjectURL(blob)
                                        window.open(url, "_blank")
                                        setTimeout(() => URL.revokeObjectURL(url), 60_000)
                                      })
                                      .catch((err) => {
                                        console.error("Failed to open document:", err)
                                        toast.error({ title: err.message || "Failed to open document" })
                                      })
                                  }}
                                >
                                  <Eye size={16} />
                                </IconButton>
                              </Tooltip>
                            </Box>

                          {doc.verifiedBy && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 0.3 }}
                            >
                              Verified by {doc.verifiedBy?.name || "Unknown"} on{" "}
                              {doc.verifiedAt ? formatDate(doc.verifiedAt) : ""}
                            </Typography>
                          )}
                          {doc.verificationRemarks && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontStyle: "italic",
                                display: "block",
                                mt: 0.3,
                              }}
                            >
                              Remarks: {doc.verificationRemarks}
                            </Typography>
                          )}
                          {canVerifyDocuments &&
                            doc.verificationStatus === "PENDING" && (
                              <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    setVerifyingDocId(doc.id);
                                    setDocRemarks("");
                                    setShowVerifyModal(true);
                                  }}
                                >
                                  Verify
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => {
                                    setRejectingDocId(doc.id);
                                    setDocRemarks("");
                                    setShowRejectModal(true);
                                  }}
                                >
                                  Reject
                                </Button>
                              </Box>
                            )}
                        </Box>
                      </Box>
                    </Card>
                  );
                })}
                {documents.length === 0 && (
                  <Box
                    sx={{ textAlign: "center", py: 6, color: "text.secondary" }}
                  >
                    <FileText size={36} style={{ opacity: 0.2 }} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      No documents uploaded yet
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          )}

          {/* Tab 2: GIS */}
          {tab === 2 && (
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  height: {
                    xs: 280,
                    sm: 340,
                    md: 400,
                    lg: 460,
                  },
                  width: "100%",
                  borderRadius: 3,
                  overflow: "hidden",
                  mb: 2,
                }}
              >
                <MapContainer
                  center={[28.4, 77.05]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom
                  zoomControl
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {parcels.map((parcel) => {
                    if (!parcel.geometry) return null;
                    try {
                      const geo = JSON.parse(parcel.geometry);
                      const positions =
                        geo.type === "Polygon"
                          ? geo.coordinates[0].map((c) => [c[1], c[0]])
                          : [];
                      if (positions.length < 3) return null;
                      const statusColorMap = {
                        acquired: "#10B981",
                        pending: "#F59E0B",
                        disputed: "#EF4444",
                        notification: "#3B82F6",
                        award: "#D97706",
                        review: "#8B5CF6",
                      };
                      const color = statusColorMap[parcel.status] || "#6366F1";
                      return (
                        <Polygon
                          key={parcel.id}
                          positions={positions}
                          pathOptions={{
                            color,
                            fillColor: color,
                            fillOpacity: 0.25,
                            weight: 2,
                          }}
                        >
                          <LeafletTooltip sticky direction="top">
                            <Box>
                              <Typography variant="caption" fontWeight={600}>
                                {parcel.parcelNumber}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ display: "block" }}
                              >
                                {parcel.area} ha · {parcel.status}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ display: "block" }}
                              >
                                Owner: {parcel.owner}
                              </Typography>
                            </Box>
                          </LeafletTooltip>
                        </Polygon>
                      );
                    } catch {
                      return null;
                    }
                  })}
                  {proposal?.affectedArea &&
                    (() => {
                      try {
                        const area =
                          typeof proposal.affectedArea === "string"
                            ? JSON.parse(proposal.affectedArea)
                            : proposal.affectedArea;
                        if (area.type === "Polygon" && area.coordinates) {
                          return (
                            <Polygon
                              positions={area.coordinates}
                              pathOptions={{
                                color: "#6366F1",
                                fillColor: "#6366F1",
                                fillOpacity: 0.2,
                                weight: 2,
                                dashArray: "5, 5",
                              }}
                            >
                              <LeafletTooltip sticky direction="top">
                                <Box>
                                  <Typography
                                    variant="caption"
                                    fontWeight={600}
                                  >
                                    Affected Area
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ display: "block" }}
                                  >
                                    {area.area?.toFixed(2) || 0} ha
                                  </Typography>
                                </Box>
                              </LeafletTooltip>
                            </Polygon>
                          );
                        }
                        if (area.type === "Circle" && area.center) {
                          return (
                            <Marker
                              position={[area.center.lat, area.center.lng]}
                            >
                              <Popup>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    fontWeight={600}
                                  >
                                    Affected Area
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ display: "block" }}
                                  >
                                    {(area.area || 0).toFixed(2)} ha
                                  </Typography>
                                </Box>
                              </Popup>
                            </Marker>
                          );
                        }
                        return null;
                      } catch {
                        return null;
                      }
                    })()}
                </MapContainer>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {[
                  {
                    color: "#10B981",
                    label: "Acquired",
                    count: parcels.filter((p) => p.status === "acquired")
                      .length,
                  },
                  {
                    color: "#F59E0B",
                    label: "Pending",
                    count: parcels.filter((p) => p.status === "pending").length,
                  },
                  {
                    color: "#3B82F6",
                    label: "Notification",
                    count: parcels.filter((p) => p.status === "notification")
                      .length,
                  },
                  {
                    color: "#EF4444",
                    label: "Disputed",
                    count: parcels.filter((p) => p.status === "disputed")
                      .length,
                  },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: item.color,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {item.label} ({item.count})
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Action Modal */}
      <Dialog
        open={showActionModal}
        onClose={() => setShowActionModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
          {actionType === "approve"
            ? "Approve Proposal"
            : actionType === "reject"
              ? "Reject Proposal"
              : "Request Changes"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={
              actionType === "reject"
                ? "Rejection Reason (required)"
                : "Remarks (required)"
            }
            type="text"
            fullWidth
            multiline
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={
              actionType === "reject"
                ? "Enter rejection reason..."
                : "Enter remarks..."
            }
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="outlined"
            onClick={() => setShowActionModal(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={
              actionType === "approve"
                ? "success"
                : actionType === "reject"
                  ? "error"
                  : "primary"
            }
            onClick={handleAction}
            disabled={actionLoading}
          >
            {actionLoading
              ? "Processing..."
              : actionType === "approve"
                ? "Approve"
                : actionType === "reject"
                  ? "Reject"
                  : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Proposal</DialogTitle>
        <DialogContent>
          {(() => {
            const isDraft = proposal?.status === "DRAFT";
            const isSuperAdmin = user?.role === "SUPER_ADMIN";

            if (isDraft) {
              return (
                <DialogContentText>
                  This action will permanently delete this proposal and its
                  associated records. This cannot be undone.
                </DialogContentText>
              );
            }

            if (isSuperAdmin) {
              return (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  <DialogContentText color="error.main" fontWeight={600}>
                    Warning: You are about to delete a non-draft proposal. This
                    action is irreversible.
                  </DialogContentText>
                  <DialogContentText>
                    This proposal and all its associated records will be
                    permanently deleted. This cannot be undone.
                  </DialogContentText>
                </Box>
              );
            }

            return null;
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="outlined"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Proposal"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verify Document Modal */}
      <Dialog
        open={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          setVerifyingDocId(null);
          setDocRemarks("");
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Verify Document</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Document: {documents.find((d) => d.id === verifyingDocId)?.name}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Verification Remarks"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={docRemarks}
            onChange={(e) => setDocRemarks(e.target.value)}
            placeholder="Optional remarks..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setShowVerifyModal(false);
              setVerifyingDocId(null);
              setDocRemarks("");
            }}
            disabled={docActionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleVerifyDocument}
            disabled={docActionLoading}
          >
            {docActionLoading ? "Verifying..." : "Verify Document"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Document Modal */}
      <Dialog
        open={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectingDocId(null);
          setDocRemarks("");
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Document</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Document: {documents.find((d) => d.id === rejectingDocId)?.name}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for rejection"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={docRemarks}
            onChange={(e) => setDocRemarks(e.target.value)}
            placeholder="Provide a reason for rejection..."
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setShowRejectModal(false);
              setRejectingDocId(null);
              setDocRemarks("");
            }}
            disabled={docActionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectDocument}
            disabled={docActionLoading}
          >
            {docActionLoading ? "Rejecting..." : "Reject Document"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      {toast && (
        <Card
          elevation={0}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1300,
            borderRadius: 3,
            px: 3,
            py: 2,
            bgcolor: toast.type === "error" ? "error.main" : "success.main",
            color: "white",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {toast.message}
          </Typography>
        </Card>
      )}
    </Box>
  );
};

export default ProposalDetails;
