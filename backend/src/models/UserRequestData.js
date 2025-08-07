const Database = require('../config/database');

class UserRequestData {
  // Create a new data request
  static async createRequest(requestData) {
    const query = `
      INSERT INTO user_request_data (user_id, data_name, purpose, organization, contact_email, additional_info)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      requestData.user_id,
      requestData.data_name,
      requestData.purpose,
      requestData.organization,
      requestData.contact_email,
      requestData.additional_info || null
    ];
    
    try {
      const result = await Database.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating data request:', error);
      throw new Error('Failed to create data request');
    }
  }

  // Get all requests for a specific user
  static async getRequestsByUserId(userId) {
    const query = `
      SELECT 
        udr.id,
        udr.data_name,
        udr.purpose,
        udr.organization,
        udr.contact_email,
        udr.additional_info,
        udr.requested_at,
        udr.is_approved,
        udr.reviewed_at,
        reviewer.user_name as reviewer_name
      FROM user_request_data udr
      LEFT JOIN users reviewer ON udr.reviewed_by = reviewer.id
      WHERE udr.user_id = $1
      ORDER BY udr.requested_at DESC
    `;
    
    try {
      const result = await Database.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting user requests:', error);
      throw new Error('Failed to get user requests');
    }
  }

  // Get all requests (admin only)
  static async getAllRequests(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        udr.id,
        udr.data_name,
        udr.purpose,
        udr.organization,
        udr.contact_email,
        udr.additional_info,
        udr.requested_at,
        udr.is_approved,
        udr.reviewed_at,
        u.user_name as requester_name,
        u.email as requester_email,
        reviewer.user_name as reviewer_name
      FROM user_request_data udr
      JOIN users u ON udr.user_id = u.id
      LEFT JOIN users reviewer ON udr.reviewed_by = reviewer.id
      ORDER BY udr.requested_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    try {
      const result = await Database.query(query, [limit, offset]);
      
      // Get total count
      const countQuery = 'SELECT COUNT(*) as total FROM user_request_data';
      const countResult = await Database.query(countQuery);
      
      return {
        requests: result.rows,
        total: parseInt(countResult.rows[0].total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      };
    } catch (error) {
      console.error('Error getting all requests:', error);
      throw new Error('Failed to get all requests');
    }
  }

  // Get pending requests
  static async getPendingRequests() {
    const query = `
      SELECT 
        udr.id,
        udr.data_name,
        udr.purpose,
        udr.organization,
        udr.contact_email,
        udr.additional_info,
        udr.requested_at,
        u.user_name as requester_name,
        u.email as requester_email
      FROM user_request_data udr
      JOIN users u ON udr.user_id = u.id
      WHERE udr.is_approved IS NULL
      ORDER BY udr.requested_at ASC
    `;
    
    try {
      const result = await Database.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting pending requests:', error);
      throw new Error('Failed to get pending requests');
    }
  }

  // Approve or reject a request
  static async reviewRequest(requestId, isApproved, reviewerId) {
    const query = `
      UPDATE user_request_data 
      SET is_approved = $1, reviewed_at = NOW(), reviewed_by = $2
      WHERE id = $3
      RETURNING *
    `;
    
    try {
      const result = await Database.query(query, [isApproved, reviewerId, requestId]);
      if (result.rows.length === 0) {
        throw new Error('Request not found');
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error reviewing request:', error);
      throw new Error('Failed to review request');
    }
  }

  // Get request by ID
  static async getRequestById(requestId) {
    const query = `
      SELECT 
        udr.id,
        udr.user_id,
        udr.data_name,
        udr.purpose,
        udr.organization,
        udr.contact_email,
        udr.additional_info,
        udr.requested_at,
        udr.is_approved,
        udr.reviewed_at,
        u.user_name as requester_name,
        u.email as requester_email,
        reviewer.user_name as reviewer_name
      FROM user_request_data udr
      JOIN users u ON udr.user_id = u.id
      LEFT JOIN users reviewer ON udr.reviewed_by = reviewer.id
      WHERE udr.id = $1
    `;
    
    try {
      const result = await Database.query(query, [requestId]);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error getting request by ID:', error);
      throw new Error('Failed to get request');
    }
  }

  // Delete a request
  static async deleteRequest(requestId) {
    const query = 'DELETE FROM user_request_data WHERE id = $1 RETURNING *';
    
    try {
      const result = await Database.query(query, [requestId]);
      if (result.rows.length === 0) {
        throw new Error('Request not found');
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting request:', error);
      throw new Error('Failed to delete request');
    }
  }

  // Get statistics
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE is_approved IS NULL) as pending_requests,
        COUNT(*) FILTER (WHERE is_approved = true) as approved_requests,
        COUNT(*) FILTER (WHERE is_approved = false) as rejected_requests
      FROM user_request_data
    `;
    
    try {
      const result = await Database.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw new Error('Failed to get statistics');
    }
  }
}

module.exports = UserRequestData; 