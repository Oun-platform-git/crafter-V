import { FC, useState, useEffect } from 'react';
import {
  Drawer,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Button,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Group as UsersIcon,
  Comment as CommentIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Check as ResolveIcon,
  Add as AddIcon
} from '@mui/icons-material';
import CollaborationService, {
  User,
  Comment,
  Version,
  Change
} from '../../../services/CollaborationService';

interface CollaborationPanelProps {
  collaborationService: CollaborationService;
  currentUser: User;
}

const CollaborationPanel: FC<CollaborationPanelProps> = ({
  collaborationService,
  currentUser
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newVersion, setNewVersion] = useState({
    name: '',
    description: ''
  });
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);

  useEffect(() => {
    // Listen for collaboration events
    collaborationService.on('users-changed', setUsers);
    collaborationService.on('comment-added', (comment: Comment) => {
      setComments(prev => [...prev, comment]);
    });
    collaborationService.on('comment-updated', (updatedComment: Comment) => {
      setComments(prev =>
        prev.map(c => (c.id === updatedComment.id ? updatedComment : c))
      );
    });
    collaborationService.on('version-created', (version: Version) => {
      setVersions(prev => [...prev, version]);
    });

    return () => {
      collaborationService.removeAllListeners();
    };
  }, [collaborationService]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      collaborationService.addComment(newComment);
      setNewComment('');
    }
  };

  const handleReplyToComment = (commentId: string, replyText: string) => {
    collaborationService.replyToComment(commentId, replyText);
    setSelectedComment(null);
  };

  const handleResolveComment = (commentId: string) => {
    collaborationService.updateComment(commentId, { resolved: true });
  };

  const handleCreateVersion = () => {
    if (newVersion.name) {
      collaborationService.createVersion(
        newVersion.name,
        newVersion.description
      );
      setNewVersion({ name: '', description: '' });
      setIsVersionDialogOpen(false);
    }
  };

  const handleSwitchVersion = (versionId: string) => {
    collaborationService.switchToVersion(versionId);
  };

  return (
    <>
      <IconButton
        onClick={() => setIsOpen(true)}
        className="collaboration-toggle"
        color="primary"
      >
        <Badge
          badgeContent={users.length - 1}
          color="secondary"
        >
          <UsersIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="collaboration-drawer"
      >
        <div className="collaboration-panel">
          <div className="collaboration-header">
            <Typography variant="h6">Collaboration</Typography>
            <IconButton onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>

          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab icon={<UsersIcon />} label="Users" />
            <Tab
              icon={<Badge badgeContent={comments.filter(c => !c.resolved).length} color="error">
                <CommentIcon />
              </Badge>}
              label="Comments"
            />
            <Tab icon={<HistoryIcon />} label="Versions" />
          </Tabs>

          <div className="collaboration-content">
            {activeTab === 0 && (
              <div className="users-list">
                <List>
                  {users.map(user => (
                    <ListItem key={user.id}>
                      <ListItemAvatar>
                        <Avatar
                          style={{ backgroundColor: user.color }}
                          src={user.avatar}
                        >
                          {user.name[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name}
                        secondary={user.role}
                        style={{
                          opacity: user.id === currentUser.id ? 1 : 0.7
                        }}
                      />
                      {user.cursor && (
                        <Tooltip title={`Last active: ${new Date(user.cursor.timestamp).toLocaleTimeString()}`}>
                          <div className="user-status active" />
                        </Tooltip>
                      )}
                    </ListItem>
                  ))}
                </List>
              </div>
            )}

            {activeTab === 1 && (
              <div className="comments-section">
                <div className="comments-list">
                  {comments.map(comment => (
                    <div
                      key={comment.id}
                      className={`comment-item ${comment.resolved ? 'resolved' : ''}`}
                    >
                      <div className="comment-header">
                        <Avatar
                          src={users.find(u => u.id === comment.userId)?.avatar}
                          style={{
                            backgroundColor: users.find(u => u.id === comment.userId)?.color
                          }}
                        />
                        <Typography variant="subtitle2">
                          {users.find(u => u.id === comment.userId)?.name}
                        </Typography>
                        <Typography variant="caption">
                          {new Date(comment.timestamp).toLocaleString()}
                        </Typography>
                      </div>

                      <Typography className="comment-text">
                        {comment.text}
                      </Typography>

                      {comment.timelinePosition && (
                        <Typography variant="caption" className="comment-timeline">
                          at {comment.timelinePosition.time}s
                          {comment.timelinePosition.trackId && ` on track ${comment.timelinePosition.trackId}`}
                        </Typography>
                      )}

                      {comment.attachments?.map((attachment, index) => (
                        <div key={index} className="comment-attachment">
                          {attachment.type === 'image' && (
                            <img src={attachment.content} alt="Attachment" />
                          )}
                          {attachment.type === 'drawing' && (
                            <img src={attachment.content} alt="Drawing" />
                          )}
                        </div>
                      ))}

                      <div className="comment-actions">
                        <Button
                          size="small"
                          onClick={() => setSelectedComment(comment)}
                        >
                          Reply
                        </Button>
                        {!comment.resolved && (
                          <IconButton
                            size="small"
                            onClick={() => handleResolveComment(comment.id)}
                          >
                            <ResolveIcon />
                          </IconButton>
                        )}
                      </div>

                      {comment.replies.length > 0 && (
                        <div className="comment-replies">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="reply-item">
                              <Avatar
                                src={users.find(u => u.id === reply.userId)?.avatar}
                                style={{
                                  backgroundColor: users.find(u => u.id === reply.userId)?.color
                                }}
                              />
                              <div className="reply-content">
                                <Typography variant="subtitle2">
                                  {users.find(u => u.id === reply.userId)?.name}
                                </Typography>
                                <Typography>{reply.text}</Typography>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="comment-input">
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                  />
                  <IconButton
                    color="primary"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="versions-section">
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setIsVersionDialogOpen(true)}
                  className="create-version-button"
                >
                  Create Version
                </Button>

                <List className="versions-list">
                  {versions.map(version => (
                    <ListItem
                      key={version.id}
                      button
                      onClick={() => handleSwitchVersion(version.id)}
                    >
                      <ListItemAvatar>
                        {version.thumbnail ? (
                          <Avatar src={version.thumbnail} />
                        ) : (
                          <Avatar>
                            <HistoryIcon />
                          </Avatar>
                        )}
                      </ListItemAvatar>
                      <ListItemText
                        primary={version.name}
                        secondary={`${new Date(version.timestamp).toLocaleString()} by ${
                          users.find(u => u.id === version.userId)?.name
                        }`}
                      />
                    </ListItem>
                  ))}
                </List>
              </div>
            )}
          </div>
        </div>

        <Dialog
          open={isVersionDialogOpen}
          onClose={() => setIsVersionDialogOpen(false)}
        >
          <DialogTitle>Create New Version</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Version Name"
              value={newVersion.name}
              onChange={(e) => setNewVersion(prev => ({
                ...prev,
                name: e.target.value
              }))}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={newVersion.description}
              onChange={(e) => setNewVersion(prev => ({
                ...prev,
                description: e.target.value
              }))}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsVersionDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateVersion}
              color="primary"
              disabled={!newVersion.name}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>

        <style jsx>{`
          .collaboration-panel {
            width: 400px;
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .collaboration-header {
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #ccc;
          }

          .collaboration-content {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
          }

          .user-status {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-left: 8px;
          }

          .user-status.active {
            background-color: #4caf50;
          }

          .comments-section {
            display: flex;
            flex-direction: column;
            height: 100%;
          }

          .comments-list {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 16px;
          }

          .comment-item {
            margin-bottom: 16px;
            padding: 16px;
            border-radius: 4px;
            background-color: #f5f5f5;
          }

          .comment-item.resolved {
            opacity: 0.7;
          }

          .comment-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .comment-text {
            margin-bottom: 8px;
          }

          .comment-timeline {
            color: #666;
            margin-bottom: 8px;
          }

          .comment-attachment {
            margin-top: 8px;
          }

          .comment-attachment img {
            max-width: 100%;
            border-radius: 4px;
          }

          .comment-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 8px;
          }

          .comment-replies {
            margin-top: 16px;
            padding-left: 16px;
            border-left: 2px solid #ccc;
          }

          .reply-item {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
          }

          .reply-content {
            flex: 1;
          }

          .comment-input {
            display: flex;
            gap: 8px;
            padding: 16px;
            background-color: #fff;
            border-top: 1px solid #ccc;
          }

          .versions-section {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .create-version-button {
            align-self: flex-start;
          }

          .versions-list {
            flex: 1;
            overflow-y: auto;
          }
        `}</style>
      </Drawer>
    </>
  );
};

export default CollaborationPanel;
