//NOTE: Unused because I didn't want to go through the process of verifying my app to use restricted scopes
import mjml2html from "mjml";

const generateTemplate = ({
  userEmail,
  userName,
  uuid,
  subject,
  body
}) => {

  const template = `
    <mjml>
      <mj-body width="100%" height="100%">
        <mj-container>
          <mj-section background-color="#2196f3" padding="10px" border-radius="5px">
            <mj-column background-color="#FFF" padding="20px" border-radius="5px">
              <mj-text font-size="18px" color="#2196f3">
                <b>User Name:</b> <span style="color:#000">${userName}</span>
              </mj-text>
              <mj-text font-size="18px" color="#2196f3">
                <b>User Email:</b> <span style="color:#000">${userEmail}</span>
              </mj-text>
              <mj-text font-size="18px" color="#2196f3">
                <b>UUID:</b> <span style="color:#000">${uuid}</span>
              </mj-text>
              <mj-text font-size="18px" color="#2196f3">
                <b>Subject:</b> <span style="color:#000">${subject}</span>
              </mj-text>
              <mj-text font-size="18px" color="#2196f3">
                <b>Feedback:</b>
              </mj-text>
              <mj-divider border-color="#2196f3" />
              <mj-text font-size="14px">
                ${body}
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-container>
      </mj-body>
    </mjml>
  `

  const email = mjml2html(template).html

  return email
}

export default generateTemplate