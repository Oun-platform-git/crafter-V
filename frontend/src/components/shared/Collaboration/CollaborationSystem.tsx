import { FC, useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Button,
  TextField,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Share as ShareIcon,
  PersonAdd as InviteIcon,
  Chat as ChatIcon,
  History as HistoryIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon
} from '@mui/icons-material';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
  online: boolean;
  lastActive: Date;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
  replies: Comment[];
}

interface CollaborationSystemProps {
  projectId: string;
  currentUserId: string;
  onShareProject: (emails: string[]) => Promise<void>;
  onUpdatePermissions: (userId: string, role: Collaborator['role']) => Promise<void>;
  onAddComment: (content: string, timelinePosition?: number) => Promise<void>;
  onResolveComment: (commentId: string) => Promise<void>;
}

const CollaborationSystem: FC<CollaborationSystemProps> = ({
  projectId,
  currentUserId,
  onShareProject,
  onUpdatePermissions,
  onAddComment,
  onResolveComment
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'collaborators' | 'comments'>('collaborators');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [inviteEmails, setInviteEmails] = useState('');
  const [newComment, setNewComment] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Real-time collaboration setup
  useEffect(() => {
    const socket = new WebSocket('wss://your-collaboration-server.com');
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'collaborator_update':
          setCollaborators(data.collaborators);
          break;
        case 'new_comment':
          setComments(prev => [...prev, data.comment]);
          break;
        case 'comment_resolved':
          setComments(prev => prev.map(c => 
            c.id === data.commentId ? { ...c, resolved: true } : c
          ));
          break;
      }
    };

    return () => socket.close();
  }, [projectId]);

  const handleShare = async () => {
    const emails = inviteEmails.split(',').map(email => email.trim());
    await onShareProject(emails);
    setShareDialogOpen(false);
    setInviteEmails('');
  };

  const handlePermissionChange = async (userId: string, newRole: Collaborator['role']) => {
    await onUpdatePermissions(userId, newRole);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await onAddComment(newComment);
    setNewComment('');
  };

  return (
    <>
      <IconButton onClick={() => setIsOpen(true)} color="primary">
        <Badge badgeContent={comments.filter(c => !c.resolved).length} color="error">
          <ShareIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{ sx: { width: 320 } }}
      >
        <div className="collaboration-system">
          <div className="header">
            <Typography variant="h6">Collaboration</Typography>
            <Button
              startIcon={<InviteIcon />}
              onClick={() => setShareDialogOpen(true)}
            >
              Invite
            </Button>
          </div>

          <div className="tabs">
            <Button
              variant={activeTab === 'collaborators' ? 'contained' : 'text'}
              onClick={() => setActiveTab('collaborators')}
            >
              Collaborators
            </Button>
            <Button
              variant={activeTab === 'comments' ? 'contained' : 'text'}
              onClick={() => setActiveTab('comments')}
            >
              Comments
            </Button>
          </div>

          {activeTab === 'collaborators' && (
            <List>
              {collaborators.map(collaborator => (
                <ListItem key={collaborator.id}>
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      color={collaborator.online ? 'success' : 'default'}
                    >
                      <Avatar src={collaborator.avatar} alt={collaborator.name} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={collaborator.name}
                    secondary={
                      <>
                        <Chip
                          size="small"
                          label={collaborator.role}
                          color={collaborator.role === 'owner' ? 'primary' : 'default'}
                        />
                        {!collaborator.online && (
                          <Typography variant="caption" component="span" sx={{ ml: 1 }}>
                            Last active: {collaborator.lastActive.toLocaleString()}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  {currentUserId !== collaborator.id && (
                    <IconButton
                      onClick={() => handlePermissionChange(
                        collaborator.id,
                        collaborator.role === 'editor' ? 'viewer' : 'editor'
                      )}
                    >
                      {collaborator.role === 'editor' ? <LockIcon /> : <UnlockIcon />}
                    </IconButton>
                  )}
                </ListItem>
              ))}
            </List>
          )}

          {activeTab === 'comments' && (
            <div className="comments-section">
              <List>
                {comments.map(comment => (
                  <ListItem key={comment.id}>
                    <ListItemAvatar>
                      <Avatar src={comment.userAvatar} alt={comment.userName} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <div className="comment-header">
                          <Typography variant="subtitle2">{comment.userName}</Typography>
                          <Typography variant="caption">
                            {comment.timestamp.toLocaleString()}
                          </Typography>
                        </div>
                      }
                      secondary={
                        <div className="comment-content">
                          <Typography variant="body2">{comment.content}</Typography>
                          {comment.resolved && (
                            <Chip size="small" label="Resolved" color="success" />
                          )}
                        </div>
                      }
                    />
                    {!comment.resolved && (
                      <IconButton
                        size="small"
                        onClick={() => onResolveComment(comment.id)}
                      >
                        <HistoryIcon />
                      </IconButton>
                    )}
                  </ListItem>
                ))}
              </List>

              <div className="comment-input">
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  startIcon={<ChatIcon />}
                >
                  Comment
                </Button>
              </div>
            </div>
          )}
        </div>
      </Drawer>

      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={inviteEmails}
            onChange={(e) => setInviteEmails(e.target.value)}
            placeholder="Enter email addresses (comma-separated)"
            variant="outlined"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleShare}
            variant="contained"
            disabled={!inviteEmails.trim()}
          >
            Share
          </Button>
        </DialogActions>
      </Dialog>

      <style>
        {`
        .collaboration-system {
          padding: 16px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .comment-content {
          margin-top: 4px;
        }

        .comment-input {
          position: sticky;
          bottom: 0;
          background: white;
          padding: 16px;
          border-top: 1px solid #eee;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        `}
      </style>
    </>
  );
};

export default CollaborationSystem;
