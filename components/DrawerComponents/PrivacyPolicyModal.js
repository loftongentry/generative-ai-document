import { Box, Dialog, DialogContent, DialogTitle, Divider, IconButton, List, ListItemText, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';

const PrivacyPolicyModal = (props) => {
  const { privacyPolicyModal, handlePrivacyPolicyModalClose } = props

  return (
    <Dialog
      fullWidth={true}
      maxWidth='md'
      open={privacyPolicyModal}
    >
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Typography variant="h5">
              Privacy Policy
            </Typography>
          </Box>
          <IconButton onClick={handlePrivacyPolicyModalClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          overflowY: 'scroll',
          '&::-webkit-scrollbar': {
            width: '5px',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '8px',
            minHeight: '24px',
            backgroundColor: 'transparent'
          },
          '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: '#b7b7b7'
          }
        }}
      >
        <Typography variant='h5'>
          Effective Date: 5/27/2024
        </Typography>
        <Typography variant='h6'>
          Introduction
        </Typography>
        <Typography gutterBottom>
          Welcome to the Generative AI Document Analyzer. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, and how we protect it.
        </Typography>
        <Divider />
        <Typography variant='h6'>
          Legal and Compliance Requirements
        </Typography>
        <Typography gutterBottom>
          This Privacy Policy complies with legal requirements, including but not limited to the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
        </Typography>
        <Divider />
        <Typography variant='h6'>
          Legal Basis for Processing Personal Data
        </Typography>
        <Typography>
          We collect and process personal data based on the following legal grounds:
          <List>
            <ListItemText>
              <b>Consent</b>: We collect and process data with your consent, which you can withdraw at any time.
            </ListItemText>
            <ListItemText>
              <b>Contractual Necessity</b>: The processing is necessary for the performance of a contract to which you are a party or to take steps at your request prior to entering into a contract.
            </ListItemText>
            <ListItemText>
              <b>Legitimate Interests</b>: The processing is necessary for our legitimate interests, such as improving our services and securing our platform.
            </ListItemText>
            <ListItemText>
              <b>Legal Obligations</b>: The processing is necessary to comply with legal obligations.
            </ListItemText>
          </List>
        </Typography>
        <Divider />
        <Typography variant='h6'>
          Information We Collect
        </Typography>
        <Typography>
          When you use our App, we collect the following information:
          <List>
            <ListItemText>
              <b>Name</b>: Your name, as provided by your Google account.
            </ListItemText>
            <ListItemText>
              <b>Email</b>: Your email address, as provided by your Google account.
            </ListItemText>
            <ListItemText>
              <b>OpenID</b>: Your unique OpenID identifier, as provided by your Google account.
            </ListItemText>
          </List>
        </Typography>
        <Divider />
        <Typography variant='h6'>
          How We Use Your Information
        </Typography>
        <Typography>
          The information we collect is used solely for the following purposes:
          <List>
            <ListItemText>
              <b>User Authentication</b>: To verify your identity and allow you to access the App.
            </ListItemText>
            <ListItemText>
              <b>Association of Analysis</b>: To associate your analysis with your Gmail account, ensuring that your results are linked to you personally and are not accessible or visible to other Gmail accounts.
            </ListItemText>
          </List>
        </Typography>
        <Divider />
        <Typography variant='h6'>
          Data Sharing and Disclosure
        </Typography>
        <Typography gutterBottom>
          We do not share, sell, or disclose your personal information to third parties. Your information is used exclusively within our App for the purposes stated above.
        </Typography>
        <Divider />
        <Typography variant='h6'>
          Data Security
        </Typography>
        <Typography gutterBottom>
          We take the security of your personal information seriously and implement appropriate technical and organizational measures to protect it against unauthorized access, disclosure, alteration, or destruction.
        </Typography>
        <Divider />
        <Typography variant='h6'>
          User Rights
        </Typography>
        <Typography>
          You have the right to:
          <List>
            <ListItemText>
              <b>Access</b>: Request access to the personal information we hold about you.
            </ListItemText>
            <ListItemText>
              <b>Correction</b>: Request correction of any inaccurate or incomplete information.
            </ListItemText>
            <ListItemText>
              <b>Deletion</b>: Request the deletion of your personal information.
              To exercise any of these rights, please contact us at the email below. Additionally, you are able to delete your account and/or associated analysis through the app as well.
            </ListItemText>
            <ListItemText>
              <b>Objection</b>: Object to the processing of your personal information under certain circumstances.
            </ListItemText>
            <ListItemText>
              <b>Portability</b>: Request the transfer of your personal information to another party.
            </ListItemText>
          </List>
        </Typography>
        <Divider />
        <Typography variant='h6'>
          Changes to This Privacy Policy
        </Typography>
        <Typography gutterBottom>
          This Privacy Policy may be updated from time to time. You will be notified you of any changes by posting the new Privacy Policy on this page and updating the effective date at the top.
        </Typography>
        <Divider />
        <Typography variant='h6'>
          Contact Us
        </Typography>
        <Typography>
          If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
          <List>
            <ListItemText>
              cary.l.gentry.jr@gmail.com
            </ListItemText>
          </List>
        </Typography>
      </DialogContent>
    </Dialog>
  )
}

export default PrivacyPolicyModal