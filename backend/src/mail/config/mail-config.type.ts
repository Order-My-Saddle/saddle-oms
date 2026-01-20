export type MailConfig = {
  port: number;
  host?: string;
  user?: string;
  password?: string;
  defaultEmail?: string;
  defaultName?: string;
  ignoreTLS: boolean;
  secure: boolean;
  requireTLS: boolean;
  mailgun?: {
    apiKey?: string;
    domainOrderMySaddle?: string;
    domainAviar?: string;
    baseUrl?: string;
  };
};
