import { THEMES } from '../constants';

const wrapWithLayout = string => `
<Layout>
  ${string}
</Layout>`;

const sourceForThemes = theme => `
<Cell>
  <Notification theme="${theme}" show>
    <Notification.TextLabel>${theme} theme</Notification.TextLabel>
    <Notification.CloseButton/>
  </Notification>
</Cell>`;

export const themes = wrapWithLayout(
  Object.values(THEMES)
    .map(sourceForThemes)
    .join(''),
);

export const actions = `
<Layout>
  <Cell>
    <Notification show>
      <Notification.TextLabel>This notification has</Notification.TextLabel>
      <Notification.ActionButton type="textLink" onClick={() => console.log('Clicked!')}>
        text link action
      </Notification.ActionButton>
      <Notification.CloseButton />
    </Notification>
  </Cell>

  <Cell>
    <Notification show>
      <Notification.TextLabel>This notification has</Notification.TextLabel>
      <Notification.ActionButton onClick={() => console.log('Clicked!')}>
        button
      </Notification.ActionButton>
      <Notification.CloseButton />
    </Notification>
  </Cell>
</Layout>
`;

export const ellipsis = `
<Layout>
  <Cell>
      <Notification show>
        <Notification.TextLabel>
            This notification appears with extremely long text and it doesn't fit in a single line. It requires to enable ellipsis feature or wrap the text in multiple lines.
        </Notification.TextLabel>
        <Notification.ActionButton onClick={() => console.log('Clicked!')}>
        button
        </Notification.ActionButton>
        <Notification.CloseButton />
      </Notification>
  </Cell>
  <Cell>
     <Notification show>
      <Notification.TextLabel ellipsis={false}>
        This notification appears with extremely long text and it doesn't fit in a single line. It requires to enable ellipsis feature or wrap the text in multiple lines.
      </Notification.TextLabel>
      <Notification.ActionButton onClick={() => console.log('Clicked!')}>
      button
    </Notification.ActionButton>
      <Notification.CloseButton />
    </Notification>
  </Cell>
</Layout>
`;

export const controlled = `
() => {

const [show, setShow] = React.useState(false)

return <Layout>
    <Cell><Button onClick={() => setShow(!show)}>Show / Hide Notification</Button></Cell>
    <Cell>
    <Notification onClose={() => setShow(false)}  theme='error' show={show}>
    <Notification.TextLabel ellipsis={false}>
        This notification appears with extremely long text and it doesn't fit in a single line. It requires to enable ellipsis feature or wrap the text in multiple lines.
    </Notification.TextLabel>
    <Notification.ActionButton onClick={() => console.log('Clicked!')}>
      button
    </Notification.ActionButton>
    <Notification.CloseButton />
  </Notification>
  </Cell>
  <Cell><Text>The Life and Strange Surprizing Adventures of Robinson Crusoe, Of York, Mariner: Who lived Eight and Twenty Years, all alone in an un-inhabited Island on the Coast of America, near the Mouth of the Great River of Oroonoque; Having been cast on Shore by Shipwreck, wherein all the Men perished but himself. With An Account how he was at last as strangely deliver'd by Pyrates</Text></Cell>
</Layout>
};
`;
