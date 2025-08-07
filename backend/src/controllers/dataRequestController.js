const UserRequestData = require('../models/UserRequestData');

// Create a new data request
const createDataRequest = async (req, res) => {
  try {
    const { dataName, purpose, organization, contactEmail, additionalInfo } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!dataName || !purpose || !organization || !contactEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: dataName, purpose, organization, and contactEmail are required'
      });
    }

    // Create the request
    const requestData = {
      user_id: userId,
      data_name: dataName,
      purpose: purpose,
      organization: organization,
      contact_email: contactEmail,
      additional_info: additionalInfo || null
    };

    const newRequest = await UserRequestData.createRequest(requestData);

    res.status(201).json({
      success: true,
      message: 'Data access request submitted successfully',
      data: {
        request: {
          id: newRequest.id,
          dataName: newRequest.data_name,
          purpose: newRequest.purpose,
          organization: newRequest.organization,
          contactEmail: newRequest.contact_email,
          additionalInfo: newRequest.additional_info,
          requestedAt: newRequest.requested_at,
          status: 'pending'
        }
      }
    });
  } catch (error) {
    console.error('Create data request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit data access request'
    });
  }
};

// Get current user's requests
const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await UserRequestData.getRequestsByUserId(userId);

    const formattedRequests = requests.map(request => ({
      id: request.id,
      dataName: request.data_name,
      purpose: request.purpose,
      organization: request.organization,
      contactEmail: request.contact_email,
      additionalInfo: request.additional_info,
      requestedAt: request.requested_at,
      status: request.is_approved === null ? 'pending' : 
              request.is_approved ? 'approved' : 'rejected',
      reviewedAt: request.reviewed_at,
      reviewerName: request.reviewer_name
    }));

    res.json({
      success: true,
      message: 'User requests retrieved successfully',
      data: {
        requests: formattedRequests
      }
    });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user requests'
    });
  }
};

// Get all requests (admin only)
const getAllRequests = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const result = await UserRequestData.getAllRequests(page, limit);

    const formattedRequests = result.requests.map(request => ({
      id: request.id,
      dataName: request.data_name,
      purpose: request.purpose,
      organization: request.organization,
      contactEmail: request.contact_email,
      additionalInfo: request.additional_info,
      requestedAt: request.requested_at,
      status: request.is_approved === null ? 'pending' : 
              request.is_approved ? 'approved' : 'rejected',
      reviewedAt: request.reviewed_at,
      requesterName: request.requester_name,
      requesterEmail: request.requester_email,
      reviewerName: request.reviewer_name
    }));

    res.json({
      success: true,
      message: 'All requests retrieved successfully',
      data: {
        requests: formattedRequests,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve all requests'
    });
  }
};

// Get pending requests (admin only)
const getPendingRequests = async (req, res) => {
  try {
    const requests = await UserRequestData.getPendingRequests();

    const formattedRequests = requests.map(request => ({
      id: request.id,
      dataName: request.data_name,
      purpose: request.purpose,
      organization: request.organization,
      contactEmail: request.contact_email,
      additionalInfo: request.additional_info,
      requestedAt: request.requested_at,
      requesterName: request.requester_name,
      requesterEmail: request.requester_email
    }));

    res.json({
      success: true,
      message: 'Pending requests retrieved successfully',
      data: {
        requests: formattedRequests
      }
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending requests'
    });
  }
};

// Review a request (approve/reject) (admin only)
const reviewRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const reviewerId = req.user.id;

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isApproved must be a boolean value'
      });
    }

    const updatedRequest = await UserRequestData.reviewRequest(id, isApproved, reviewerId);

    res.json({
      success: true,
      message: `Request ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: {
        request: {
          id: updatedRequest.id,
          dataName: updatedRequest.data_name,
          status: updatedRequest.is_approved ? 'approved' : 'rejected',
          reviewedAt: updatedRequest.reviewed_at
        }
      }
    });
  } catch (error) {
    console.error('Review request error:', error);
    
    if (error.message === 'Request not found') {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to review request'
    });
  }
};

// Get request by ID
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await UserRequestData.getRequestById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user can access this request (owner or admin)
    if (request.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const formattedRequest = {
      id: request.id,
      dataName: request.data_name,
      purpose: request.purpose,
      organization: request.organization,
      contactEmail: request.contact_email,
      additionalInfo: request.additional_info,
      requestedAt: request.requested_at,
      status: request.is_approved === null ? 'pending' : 
              request.is_approved ? 'approved' : 'rejected',
      reviewedAt: request.reviewed_at,
      requesterName: request.requester_name,
      requesterEmail: request.requester_email,
      reviewerName: request.reviewer_name
    };

    res.json({
      success: true,
      message: 'Request retrieved successfully',
      data: {
        request: formattedRequest
      }
    });
  } catch (error) {
    console.error('Get request by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve request'
    });
  }
};

// Get request statistics (admin only)
const getRequestStatistics = async (req, res) => {
  try {
    const stats = await UserRequestData.getStatistics();

    res.json({
      success: true,
      message: 'Request statistics retrieved successfully',
      data: {
        statistics: {
          totalRequests: parseInt(stats.total_requests),
          pendingRequests: parseInt(stats.pending_requests),
          approvedRequests: parseInt(stats.approved_requests),
          rejectedRequests: parseInt(stats.rejected_requests)
        }
      }
    });
  } catch (error) {
    console.error('Get request statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve request statistics'
    });
  }
};

module.exports = {
  createDataRequest,
  getMyRequests,
  getAllRequests,
  getPendingRequests,
  reviewRequest,
  getRequestById,
  getRequestStatistics
}; 