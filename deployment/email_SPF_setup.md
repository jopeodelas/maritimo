# SPF Record Configuration for maritimofans.pt

Para garantir a entrega de e-mails legítimos e evitar spoofing, deves definir um registo SPF no DNS do domínio:

```
maritimofans.pt.  IN  TXT  "v=spf1 include:sendgrid.net include:_spf.google.com ~all"
```

• Ajusta os `include` às plataformas que realmente enviam e-mails em teu nome (por ex. Mailgun, SendGrid, Google Workspace).  
• Propaga em todos os sub-domínios caso necessário, ou adiciona registos específicos.  
• Depois de publicado, verifica com ferramentas como MXToolbox.

Este passo é externo ao repositório, mas fica documentado aqui para que a equipa de DevOps/Infra saiba o valor exacto a aplicar. 