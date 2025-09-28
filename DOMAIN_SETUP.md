# 🌐 Connect Hostinger Domain to Netlify

This guide will help you connect your Hostinger domain to your Netlify site.

## 📋 Prerequisites

- Netlify site deployed and working
- Hostinger domain registered
- Access to Hostinger DNS settings

## 🔧 Step-by-Step Setup

### 1. Add Domain to Netlify

1. **Go to your Netlify site dashboard**
2. **Click "Domain settings"** (or go to Site settings → Domain management)
3. **Click "Add custom domain"**
4. **Enter your domain**: `yourdomain.com`
5. **Click "Add domain"**

### 2. Configure DNS in Hostinger

#### Option A: Using Hostinger DNS (Recommended)

1. **Log in to Hostinger control panel**
2. **Go to "Domains" → "Manage"**
3. **Click "DNS Zone Editor"**
4. **Delete existing A records** for your domain (if any)
5. **Add these DNS records**:

```
Type: A
Name: @
Value: 75.2.60.5
TTL: 14400

Type: CNAME
Name: www
Value: your-site-name.netlify.app
TTL: 14400
```

#### Option B: Using Netlify Nameservers

1. **In Netlify**: Copy the nameservers (e.g., `dns1.p01.nsone.net`)
2. **In Hostinger**: Go to "Domains" → "Manage" → "Nameservers"
3. **Change nameservers** to Netlify's nameservers
4. **Save changes**

### 3. Verify Domain in Netlify

1. **Wait 5-10 minutes** for DNS propagation
2. **In Netlify**: Click "Verify" next to your domain
3. **If successful**: You'll see a green checkmark
4. **If failed**: Wait longer and try again

### 4. Set Primary Domain

1. **In Netlify**: Click the three dots next to your domain
2. **Select "Set as primary domain"**
3. **Choose**: `yourdomain.com` (without www)

### 5. Enable HTTPS

1. **In Netlify**: Go to "HTTPS" tab
2. **Click "Provision certificate"**
3. **Wait for certificate to be issued** (usually 5-10 minutes)
4. **Enable "Force HTTPS"** to redirect HTTP to HTTPS

## 🔍 DNS Record Examples

### For yourdomain.com:

```
A Record:
Name: @
Value: 75.2.60.5
TTL: 14400

CNAME Record:
Name: www
Value: your-site-name.netlify.app
TTL: 14400
```

### For subdomain (e.g., birthday.yourdomain.com):

```
CNAME Record:
Name: birthday
Value: your-site-name.netlify.app
TTL: 14400
```

## ⏱️ Timeline

- **DNS propagation**: 5 minutes to 24 hours
- **SSL certificate**: 5-10 minutes after DNS is verified
- **Full setup**: Usually complete within 1 hour

## 🐛 Troubleshooting

### Domain Not Verifying
1. **Check DNS records** are correct
2. **Wait longer** for propagation
3. **Use DNS checker** tools online
4. **Contact Hostinger support** if needed

### SSL Certificate Issues
1. **Ensure domain is verified** first
2. **Check for DNS conflicts**
3. **Try deleting and re-adding domain**
4. **Contact Netlify support** if persistent

### Website Not Loading
1. **Check if domain is primary** in Netlify
2. **Verify HTTPS is enabled**
3. **Clear browser cache**
4. **Test in incognito mode**

## 🎯 Benefits

- **Custom domain**: `yourdomain.com` instead of `site.netlify.app`
- **Professional appearance**: Branded URL
- **SEO benefits**: Better search engine ranking
- **SSL certificate**: Free HTTPS encryption
- **CDN**: Fast global content delivery

## 📞 Support

### Hostinger Support
- **Live chat**: Available 24/7
- **Email**: support@hostinger.com
- **Help center**: help.hostinger.com

### Netlify Support
- **Documentation**: docs.netlify.com
- **Community**: community.netlify.com
- **Email**: support@netlify.com

## ✅ Final Checklist

- [ ] Domain added to Netlify
- [ ] DNS records configured in Hostinger
- [ ] Domain verified in Netlify
- [ ] Primary domain set
- [ ] HTTPS certificate issued
- [ ] Force HTTPS enabled
- [ ] Website loads on custom domain

Your birthday card website will be live at `yourdomain.com`! 🎉
