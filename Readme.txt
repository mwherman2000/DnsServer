did:neonation:0A5CCD13-8AFF-4643-BE13-2175D31D1951
did:sov:0A5CCD13-8AFF-4643-BE13-2175D31D1951

https://www.iso.org/obp/ui/#search

http://docs.oasis-open.org/ubl/Business-Document-NDR/v1.0/os/Business-Document-NDR-v1.0-os.html#S-SYMBOLS-AND-ABBREVIATIONS

1.2.3 Symbols and Abbreviations
ABIE
Aggregate Business Information Entity [CCTS]

ASBIE
Association Business Information Entity [CCTS]

BIE
Business Information Entity [CCTS]

BBIE
Basic Business Information Entity [CCTS]

CCTS
Core Component Technical Specification [CCTS]

CVA
Context/value Association [CVA]

NDR
Naming and Design Rules naming and design rules

TC
Technical Committee

XSD
W3C XML Schema Definition XSD schema

{
  "@context": "https://w3id.org/future-method/v1",
  "id": "did:example:123456789abcdefghi",

  "publicKey": [{
    "id": "did:example:123456789abcdefghi#keys-1",
    "type": "RsaVerificationKey2018",
    "controller": "did:example:123456789abcdefghi",
    "publicKeyPem": "-----BEGIN PUBLIC KEY...END PUBLIC KEY-----\r\n"
  }, {
    "id": "did:example:123456789abcdefghi#keys-3",
    "type": "Ieee2410VerificationKey2018",
    "controller": "did:example:123456789abcdefghi",
    "publicKeyPem": "-----BEGIN PUBLIC KEY...END PUBLIC KEY-----\r\n"
  }],

  "authentication": [
    
    "did:example:123456789abcdefghi#keys-1",
    
    "did:example:123456789abcdefghi#keys-3",
    
    
    
    {
      "id": "did:example:123456789abcdefghi#keys-2",
      "type": "Ed25519VerificationKey2018",
      "controller": "did:example:123456789abcdefghi",
      "publicKeyBase58": "H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV"
    }
  ],

  "service": [{
    "id": "did:example:123456789abcdefghi#oidc",
    "type": "OpenIdConnectVersion1.0Service",
    "serviceEndpoint": "https://openid.example.com/"
  }, {
    "id": "did:example:123456789abcdefghi#vcStore",
    "type": "CredentialRepositoryService",
    "serviceEndpoint": "https://repository.example.com/service/8377464"
  }, {
    "id": "did:example:123456789abcdefghi#xdi",
    "type": "XdiService",
    "serviceEndpoint": "https://xdi.example.com/8377464"
  }, {
    "id": "did:example:123456789abcdefghi#hub",
    "type": "HubService",
    "serviceEndpoint": "https://hub.example.com/.identity/did:example:0123456789abcdef/"
  }, {
    "id": "did:example:123456789abcdefghi#messaging",
    "type": "MessagingService",
    "serviceEndpoint": "https://example.com/messages/8377464"
  }, {
    "type": "SocialWebInboxService",
    "id": "did:example:123456789abcdefghi#inbox",
    "serviceEndpoint": "https://social.example.com/83hfh37dj",
    "description": "My public social inbox",
    "spamCost": {
      "amount": "0.50",
      "currency": "USD"
    }
  }, {
    "type": "DidAuthPushModeVersion1",
    "id": "did:example:123456789abcdefghi#push",
    "serviceEndpoint": "http://auth.example.com/did:example:123456789abcdefghi"
  }, {
    "id": "did:example:123456789abcdefghi#bops",
    "type": "BopsService",
    "serviceEndpoint": "https://bops.example.com/enterprise/"
  }]
}

DNSSEC

https://dnssec-analyzer.verisignlabs.com/microsoft.com

http://dnsviz.net/d/microsoft.com/dnssec/

