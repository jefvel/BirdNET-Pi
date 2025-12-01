#!/usr/bin/env bash
source /etc/birdnet/birdnet.conf
my_dir=$HOME/BirdNET-Pi/scripts
set -x
[ -d /etc/caddy ] || mkdir /etc/caddy
if [ -f /etc/caddy/Caddyfile ];then
  cp /etc/caddy/Caddyfile{,.original}
fi
if ! [ -z ${CADDY_PWD} ];then
HASHWORD=$(caddy hash-password --plaintext ${CADDY_PWD})
cat << EOF > /etc/caddy/Caddyfile
(cors) {
	@cors_preflight {
    method OPTIONS 
  }

	header {
		Access-Control-Allow-Origin "{header.origin}"
		Vary Origin
		Access-Control-Expose-Headers "Authorization"
		Access-Control-Allow-Credentials "true"
	}

	handle @cors_preflight {
		header {
			Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE"
			Access-Control-Max-Age "3600"
		}
		respond "" 204
	}
}


http:// ${BIRDNETPI_URL} {
  root * ${EXTRACTED}

  #import cors {header.origin}

  @protected_paths {
    not path /favicon.ico*
    # Frontend routes (Will redirect to login if not authorized)
    not path /
    not path /login
    not path /recordings*
    not path /spectrogram
    not path /species-stats
    not path /daily-charts
    not path /weekly-report
    not path /admin/*

    # Frontend assets
    not path /_next/*

    # Public API Paths
    not path /api/health
    not path /api/auth/* 
  }

  handle @protected_paths {
    forward_auth localhost:9292 {
      uri /api/auth/verify
      copy_headers Authorization
    }

    #basicauth {
      #birdnet ${HASHWORD}
    #}

    handle_path /backend/stream* {
      rewrite /stream
      reverse_proxy localhost:8000
    }
    
    handle /api* {
      reverse_proxy localhost:9292 
    }

    handle_path /backend* {
     file_server browse
      php_fastcgi unix//run/php/php-fpm.sock
    }

    handle /spectrogram.png* {
      file_server browse
    }

    handle /By_Date/* {
      file_server browse
    }

    handle /Charts/* {
      file_server browse
    }

    handle /stream* {
      reverse_proxy localhost:8000
    }

    handle /stats* {
      reverse_proxy localhost:8501
    }

    handle /log* {
      reverse_proxy localhost:8080
    }

    handle /terminal* {
      reverse_proxy localhost:8888
    }

    handle {
      reverse_proxy localhost:3000
    }
  }

  # Handle public API paths
  handle /api* {
    reverse_proxy localhost:9292 
  }

  # By default everything goes to the next frontend
  handle {
    reverse_proxy localhost:3000
  }
}
EOF
else
  cat << EOF > /etc/caddy/Caddyfile
http:// ${BIRDNETPI_URL} {
  handle_path /backend* {
    root * ${EXTRACTED}
    file_server browse
    handle /By_Date/* {
      file_server browse
    }
    handle /Charts/* {
      file_server browse
    }
    reverse_proxy /stream localhost:8000
    php_fastcgi unix//run/php/php-fpm.sock
    reverse_proxy /log* localhost:8080
    reverse_proxy /stats* localhost:8501
    reverse_proxy /terminal* localhost:8888
  }

  handle {
    reverse_proxy localhost:3000
  }
}
EOF
fi

sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo systemctl reload caddy
